"""
coletar.py
Baixa os CSVs mensais da ANP (Série Histórica de Preços de Combustíveis)
e os prepara para o processamento de margens.

URL real confirmada (por mês):
https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/
  arquivos/shpc/dsan/{ANO}/precos-gasolina-etanol-{MES}.csv
"""

import requests
import pandas as pd
from datetime import datetime
from pathlib import Path

# ─── Configurações ────────────────────────────────────────────────────────────

ESTADOS_ALVO = ["SP", "RJ", "MG", "RS", "PR", "BA", "GO", "DF"]

# Nomes REAIS dos produtos no CSV da ANP (confirmar via amostra do arquivo)
COMBUSTIVEIS_ALVO = ["GASOLINA", "ETANOL", "DIESEL", "DIESEL S10"]

# Base da URL da ANP para os arquivos mensais
ANP_BASE = (
    "https://www.gov.br/anp/pt-br/centrais-de-conteudo/"
    "dados-abertos/arquivos/shpc/dsan"
)

# Quantos meses de histórico baixar (4 meses ≈ 12-16 semanas de dados)
MESES_HISTORICO = 4

DIR_DADOS_BRUTOS      = Path(__file__).parent.parent / "dados" / "brutos"
DIR_DADOS_PROCESSADOS = Path(__file__).parent.parent / "dados"

# Colunas mínimas esperadas no CSV da ANP
COLUNAS_ESPERADAS = {
    "Regiao - Sigla", "Estado - Sigla", "Municipio", "Revenda",
    "CNPJ da Revenda", "Produto", "Data da Coleta",
    "Valor de Venda", "Valor de Compra", "Unidade de Medida", "Bandeira",
}

# ─── Funções ──────────────────────────────────────────────────────────────────

def criar_diretorios():
    DIR_DADOS_BRUTOS.mkdir(parents=True, exist_ok=True)
    DIR_DADOS_PROCESSADOS.mkdir(parents=True, exist_ok=True)
    print("[OK] Diretórios prontos.")


def urls_para_baixar(meses: int = MESES_HISTORICO) -> list:
    """Gera lista de URLs para os últimos N meses."""
    urls = []
    hoje = datetime.now()
    for i in range(meses):
        mes_offset = hoje.month - i
        if mes_offset <= 0:
            mes = mes_offset + 12
            ano = hoje.year - 1
        else:
            mes = mes_offset
            ano = hoje.year
        mes_str = str(mes).zfill(2)
        urls.append({
            "ref": f"{ano}-{mes_str}",
            "url_gasolina_etanol": f"{ANP_BASE}/{ano}/precos-gasolina-etanol-{mes_str}.csv",
            "url_diesel_gnv":      f"{ANP_BASE}/{ano}/precos-diesel-gnv-{mes_str}.csv",
        })
    return urls


def baixar_arquivo(url: str, caminho: Path) -> bool:
    """Baixa arquivo e salva em disco. Retorna True se bem-sucedido."""
    if caminho.exists():
        print(f"  [CACHE] {caminho.name}")
        return True
    print(f"  [DOWNLOAD] {url}")
    try:
        resp = requests.get(url, timeout=120, stream=True)
        resp.raise_for_status()
        with open(caminho, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        mb = caminho.stat().st_size / (1024 * 1024)
        print(f"  [OK] {caminho.name} ({mb:.1f} MB)")
        return True
    except requests.HTTPError as e:
        print(f"  [AVISO] HTTP {e.response.status_code} — {url}")
        return False
    except requests.RequestException as e:
        print(f"  [ERRO] {e}")
        return False


def carregar_csv_anp(caminho: Path) -> pd.DataFrame | None:
    """Carrega CSV da ANP com encoding UTF-8 com BOM (padrão atual) ou latin-1."""
    for enc in ["utf-8-sig", "latin-1"]:
        try:
            df = pd.read_csv(
                caminho, encoding=enc, sep=";", decimal=",",
                dtype=str, low_memory=False,
            )
            df.columns = df.columns.str.strip().str.replace('\ufeff', '', regex=False)
            # Verifica schema mínimo
            faltando = COLUNAS_ESPERADAS - set(df.columns)
            if faltando:
                print(f"  [ERRO SCHEMA] Colunas faltando: {faltando}")
                print(f"  [INFO] Colunas presentes: {list(df.columns)}")
                return None
            # Converte tipos
            df["Valor de Venda"] = pd.to_numeric(
                df["Valor de Venda"].str.replace(",", ".").str.strip(), errors="coerce"
            )
            df["Valor de Compra"] = pd.to_numeric(
                df["Valor de Compra"].str.replace(",", ".").str.strip(), errors="coerce"
            )
            df["Data da Coleta"] = pd.to_datetime(
                df["Data da Coleta"].str.strip(), format="%d/%m/%Y", errors="coerce"
            )
            for col in ["Estado - Sigla", "Produto", "Bandeira", "Municipio"]:
                df[col] = df[col].str.strip().str.upper()
            return df
        except Exception:
            continue
    print(f"  [ERRO] Não foi possível ler {caminho.name}")
    return None


def filtrar_e_agregar(df: pd.DataFrame) -> pd.DataFrame:
    """Filtra estados/produtos e agrega por semana × estado × produto × bandeira."""
    df_f = df[
        (df["Estado - Sigla"].isin(ESTADOS_ALVO)) &
        (df["Produto"].isin(COMBUSTIVEIS_ALVO)) &
        (df["Valor de Venda"] > 0)
    ].dropna(subset=["Valor de Venda", "Data da Coleta"]).copy()

    if df_f.empty:
        return df_f

    df_f["semana_ref"] = df_f["Data da Coleta"].dt.strftime("%Y-%W")

    return df_f.groupby(
        ["semana_ref", "Estado - Sigla", "Produto", "Bandeira"], as_index=False
    ).agg(
        preco_medio        = ("Valor de Venda", "mean"),
        preco_mediano      = ("Valor de Venda", "median"),
        preco_minimo       = ("Valor de Venda", "min"),
        preco_maximo       = ("Valor de Venda", "max"),
        preco_compra_medio = ("Valor de Compra", "mean"),
        qtd_postos         = ("Valor de Venda", "count"),
    ).round(4)


# ─── Ponto de entrada ─────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  COLETOR ANP — Bomba Aberta")
    print(f"  {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)

    criar_diretorios()
    alvos = urls_para_baixar(MESES_HISTORICO)
    frames = []

    for alvo in alvos:
        print(f"\n[MÊS {alvo['ref']}]")
        for chave, url in [
            ("gasolina-etanol", alvo["url_gasolina_etanol"]),
            ("diesel-gnv",      alvo["url_diesel_gnv"]),
        ]:
            caminho = DIR_DADOS_BRUTOS / f"anp_{alvo['ref']}_{chave}.csv"
            if not baixar_arquivo(url, caminho):
                continue
            df = carregar_csv_anp(caminho)
            if df is None:
                continue
            df_agr = filtrar_e_agregar(df)
            if not df_agr.empty:
                frames.append(df_agr)
                print(f"  [OK] {len(df_agr)} grupos de {caminho.name}")

    if not frames:
        print("\n[ERRO FATAL] Nenhum dado coletado.")
        exit(1)

    df_total = pd.concat(frames, ignore_index=True)
    df_total = df_total.drop_duplicates(
        subset=["semana_ref", "Estado - Sigla", "Produto", "Bandeira"]
    )

    saida = DIR_DADOS_BRUTOS / "agregado_consolidado.csv"
    df_total.to_csv(saida, index=False, encoding="utf-8")

    print(f"\n[CONCLUÍDO] {len(df_total)} registros · "
          f"{df_total['semana_ref'].nunique()} semanas · salvo em {saida.name}")
    print("[PRÓXIMO] Execute calcular_margens.py")


if __name__ == "__main__":
    main()
