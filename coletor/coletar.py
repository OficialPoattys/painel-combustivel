"""
coletar.py
Baixa os arquivos semanais (.csv) e mensais (.xlsx) da ANP
e prepara os dados para o cálculo de margens.
"""

import requests
import pandas as pd
from datetime import datetime
from pathlib import Path

# ─── Configurações ────────────────────────────────────────────────────────────

ESTADOS_ALVO = ["SP", "RJ", "MG", "RS", "PR", "BA", "GO", "DF"]

# Nomes exatos como aparecem no campo "Produto" dos arquivos da ANP
COMBUSTIVEIS_ALVO = [
    "GASOLINA COMUM",
    "ETANOL HIDRATADO",
    "DIESEL",
    "DIESEL S10",
    "GASOLINA ADITIVADA",
]

# ─── URLs FIXAS (confirmadas por você) ────────────────────────────────────────
URLS_SEMANAIS = [
    "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/qus/ultimas-4-semanas-gasolina-etanol.csv",
    "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/qus/ultimas-4-semanas-diesel-gnv.csv",
]

# Para os mensais, geramos dinamicamente o mês/ano
BASE_MENSAL = "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/dsan"

MESES_HISTORICO = 4  # Quantos meses baixar

DIR_DADOS_BRUTOS = Path(__file__).parent.parent / "dados" / "brutos"
DIR_DADOS = Path(__file__).parent.parent / "dados"
ARQUIVO_HISTORICO = DIR_DADOS_BRUTOS / "agregado_consolidado.csv"

COLUNAS_ESPERADAS = {
    "Regiao - Sigla", "Estado - Sigla", "Municipio", "Revenda",
    "CNPJ da Revenda", "Produto", "Data da Coleta",
    "Valor de Venda", "Valor de Compra", "Unidade de Medida", "Bandeira",
}

# ─── Funções ──────────────────────────────────────────────────────────────────

def criar_diretorios():
    DIR_DADOS_BRUTOS.mkdir(parents=True, exist_ok=True)
    DIR_DADOS.mkdir(parents=True, exist_ok=True)
    print("[OK] Diretórios prontos.")


def gerar_urls_mensais() -> list:
    """Gera lista de URLs para os últimos N meses (arquivos .xlsx)."""
    urls = []
    hoje = datetime.now()
    for i in range(MESES_HISTORICO):
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
            "url_gasolina_etanol": f"{BASE_MENSAL}/{ano}/{mes_str}-dados-abertos-precos-gasolina-etanol.xlsx",
            "url_diesel_gnv":      f"{BASE_MENSAL}/{ano}/{mes_str}-dados-abertos-precos-diesel-gnv.xlsx",
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


def carregar_arquivo(caminho: Path) -> pd.DataFrame | None:
    """Carrega CSV ou XLSX da ANP e retorna DataFrame padronizado."""
    # Tenta descobrir o formato pela extensão
    if caminho.suffix.lower() == ".csv":
        return _carregar_csv(caminho)
    elif caminho.suffix.lower() in [".xlsx", ".xls"]:
        return _carregar_excel(caminho)
    else:
        print(f"  [ERRO] Formato desconhecido: {caminho.suffix}")
        return None


def _carregar_csv(caminho: Path) -> pd.DataFrame | None:
    """Carrega arquivo CSV com encoding e separador adequados."""
    for enc in ["utf-8-sig", "latin-1"]:
        try:
            df = pd.read_csv(
                caminho, encoding=enc, sep=";", decimal=",",
                dtype=str, low_memory=False,
            )
            df.columns = df.columns.str.strip().str.replace('\ufeff', '', regex=False)
            return _padronizar_dataframe(df)
        except Exception:
            continue
    print(f"  [ERRO] Não foi possível ler CSV: {caminho.name}")
    return None


def _carregar_excel(caminho: Path) -> pd.DataFrame | None:
    """Carrega arquivo Excel (xlsx) da ANP."""
    try:
        df = pd.read_excel(caminho, dtype=str, engine="openpyxl")
        df.columns = df.columns.str.strip().str.replace('\ufeff', '', regex=False)
        return _padronizar_dataframe(df)
    except Exception as e:
        print(f"  [ERRO] Não foi possível ler Excel: {caminho.name} — {e}")
        return None


def _padronizar_dataframe(df: pd.DataFrame) -> pd.DataFrame | None:
    """Converte tipos, verifica schema e padroniza strings."""
    # Verifica schema mínimo
    faltando = COLUNAS_ESPERADAS - set(df.columns)
    if faltando:
        print(f"  [ERRO SCHEMA] Colunas faltando: {faltando}")
        print(f"  [INFO] Colunas presentes: {list(df.columns)}")
        return None

    # Converte tipos numéricos e data
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
        if col in df.columns:
            df[col] = df[col].str.strip().str.upper()

    return df


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


def carregar_historico_existente() -> pd.DataFrame:
    """Carrega o CSV histórico já existente, se houver."""
    if ARQUIVO_HISTORICO.exists():
        try:
            df = pd.read_csv(ARQUIVO_HISTORICO)
            print(f"[OK] Histórico existente carregado: {len(df)} registros.")
            return df
        except Exception as e:
            print(f"[AVISO] Não foi possível carregar histórico existente: {e}")
    return pd.DataFrame()


def salvar_historico(df: pd.DataFrame):
    """Salva o DataFrame consolidado, removendo duplicatas."""
    if df.empty:
        return
    df = df.drop_duplicates(
        subset=["semana_ref", "Estado - Sigla", "Produto", "Bandeira"]
    )
    ARQUIVO_HISTORICO.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(ARQUIVO_HISTORICO, index=False, encoding="utf-8")
    print(f"[OK] Histórico salvo: {len(df)} registros em {ARQUIVO_HISTORICO.name}")


# ─── Ponto de entrada ─────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  COLETOR ANP — Bomba Aberta")
    print(f"  {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)

    criar_diretorios()

    frames_novos = []

    # ── 1. Coleta SEMANAL (últimas 4 semanas) ────────────────────────────────
    print("\n[COLETA SEMANAL] Últimas 4 semanas")
    for url in URLS_SEMANAIS:
        nome_arquivo = url.split("/")[-1]  # ex: "ultimas-4-semanas-gasolina-etanol.csv"
        caminho = DIR_DADOS_BRUTOS / nome_arquivo
        if not baixar_arquivo(url, caminho):
            continue
        df = carregar_arquivo(caminho)
        if df is not None:
            df_agr = filtrar_e_agregar(df)
            if not df_agr.empty:
                frames_novos.append(df_agr)
                print(f"  [OK] {len(df_agr)} grupos de dados semanais.")

    # ── 2. Coleta MENSAL (histórico) ─────────────────────────────────────────
    print("\n[COLETA MENSAL] Últimos meses")
    for alvo in gerar_urls_mensais():
        print(f"\n[MÊS {alvo['ref']}]")
        for chave, url in [
            ("gasolina-etanol", alvo["url_gasolina_etanol"]),
            ("diesel-gnv",      alvo["url_diesel_gnv"]),
        ]:
            caminho = DIR_DADOS_BRUTOS / f"anp_{alvo['ref']}_{chave}.xlsx"
            if not baixar_arquivo(url, caminho):
                continue
            df = carregar_arquivo(caminho)
            if df is not None:
                df_agr = filtrar_e_agregar(df)
                if not df_agr.empty:
                    frames_novos.append(df_agr)
                    print(f"  [OK] {len(df_agr)} grupos de {caminho.name}")

    if not frames_novos:
        print("\n[ERRO FATAL] Nenhum dado coletado.")
        exit(1)

    df_novo = pd.concat(frames_novos, ignore_index=True)

    # ── 3. Mescla com histórico existente ─────────────────────────────────────
    df_historico = carregar_historico_existente()
    if not df_historico.empty:
        df_total = pd.concat([df_historico, df_novo], ignore_index=True)
    else:
        df_total = df_novo

    # ── 4. Salva ──────────────────────────────────────────────────────────────
    salvar_historico(df_total)

    print(f"\n[CONCLUÍDO] {len(df_total)} registros totais · "
          f"{df_total['semana_ref'].nunique()} semanas · salvo em {ARQUIVO_HISTORICO.name}")
    print("[PRÓXIMO] Execute calcular_margens.py")


if __name__ == "__main__":
    main()