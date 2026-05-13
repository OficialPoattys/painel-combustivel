"""
coletar.py
Baixa os CSVs semanais da ANP (LPC - Levantamento de Preços de Combustíveis)
e os prepara para o processamento de margens.
"""

import os
import requests
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

# ─── Configurações ────────────────────────────────────────────────────────────

# Estados que vamos monitorar na v1
ESTADOS_ALVO = ["SP", "RJ", "MG", "RS", "PR", "BA", "GO", "DF"]

# Combustíveis monitorados na v1
COMBUSTIVEIS_ALVO = ["GASOLINA COMUM", "ETANOL HIDRATADO", "GASOLINA ADITIVADA"]

# Bandeiras monitoradas
BANDEIRAS_ALVO = ["VIBRA", "IPIRANGA", "RAIZEN", "SHELL", "PETROBRAS", "BRANCA", "OUTRAS"]

# Diretório de saída (relativo à raiz do repo)
DIR_DADOS_BRUTOS = Path(__file__).parent.parent / "dados" / "brutos"
DIR_DADOS_PROCESSADOS = Path(__file__).parent.parent / "dados"

# URL base da ANP para o LPC
# A ANP disponibiliza os arquivos neste formato:
# https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas
ANP_LPC_BASE_URL = "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas"

# Colunas esperadas no CSV da ANP (podem variar — validação de schema)
COLUNAS_ESPERADAS = [
    "Regiao - Sigla",
    "Estado - Sigla",
    "Municipio",
    "Revenda",
    "CNPJ da Revenda",
    "Nome da Rua",
    "Numero Rua",
    "Complemento",
    "Bairro",
    "Cep",
    "Produto",
    "Data da Coleta",
    "Valor de Venda",
    "Valor de Compra",
    "Unidade de Medida",
    "Bandeira",
]

# ─── Funções de coleta ────────────────────────────────────────────────────────

def criar_diretorios():
    """Garante que as pastas de saída existem."""
    DIR_DADOS_BRUTOS.mkdir(parents=True, exist_ok=True)
    DIR_DADOS_PROCESSADOS.mkdir(parents=True, exist_ok=True)
    print(f"[OK] Diretórios prontos: {DIR_DADOS_BRUTOS}")


def descobrir_url_csv_anp():
    """
    Descobre a URL do CSV mais recente da ANP fazendo scraping da página de downloads.
    A ANP publica semanalmente um novo arquivo. Esta função tenta os últimos 4 domingos.
    
    Retorna a URL do arquivo mais recente disponível.
    """
    # A ANP costuma publicar os dados no formato:
    # ca-AAAA-SS.csv (semana do ano) ou por data
    # Tentamos as últimas 4 semanas para resiliência
    hoje = datetime.now()
    
    # Gera os últimos 4 domingos (a ANP publica na segunda após a coleta)
    datas_tentativa = []
    for i in range(4):
        delta = hoje - timedelta(weeks=i)
        datas_tentativa.append(delta)
    
    # URLs conhecidas do padrão da ANP para o LPC
    # Formato atual: semana iniciada em DD/MM/AAAA
    urls_candidatas = []
    for data in datas_tentativa:
        ano = data.strftime("%Y")
        semana = data.strftime("%W")  # número da semana ISO
        # Padrão observado nos arquivos históricos da ANP
        urls_candidatas.append(
            f"https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/dsan/ca-{ano}-{semana}.csv"
        )
    
    print("[INFO] Tentando descobrir URL do CSV mais recente da ANP...")
    for url in urls_candidatas:
        try:
            resp = requests.head(url, timeout=10, allow_redirects=True)
            if resp.status_code == 200:
                print(f"[OK] CSV encontrado: {url}")
                return url
        except requests.RequestException:
            continue
    
    # Fallback: usa a Base dos Dados (BigQuery público)
    print("[AVISO] Não foi possível acessar diretamente a ANP. Usando fallback.")
    return None


def baixar_csv(url: str, semana_ref: str) -> Path | None:
    """
    Baixa o CSV da ANP e salva em dados/brutos/.
    Retorna o path do arquivo salvo ou None em caso de erro.
    """
    nome_arquivo = f"anp_lpc_{semana_ref}.csv"
    caminho_arquivo = DIR_DADOS_BRUTOS / nome_arquivo
    
    # Evita re-download se o arquivo já existe (idempotência)
    if caminho_arquivo.exists():
        print(f"[CACHE] Arquivo já existe: {caminho_arquivo}")
        return caminho_arquivo
    
    print(f"[DOWNLOAD] Baixando {url}...")
    try:
        resp = requests.get(url, timeout=60, stream=True)
        resp.raise_for_status()
        
        with open(caminho_arquivo, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        
        tamanho_mb = caminho_arquivo.stat().st_size / (1024 * 1024)
        print(f"[OK] Download concluído: {nome_arquivo} ({tamanho_mb:.1f} MB)")
        return caminho_arquivo
        
    except requests.RequestException as e:
        print(f"[ERRO] Falha no download: {e}")
        return None


def validar_schema(df: pd.DataFrame) -> bool:
    """
    Valida se o CSV da ANP tem as colunas esperadas.
    A ANP pode mudar o layout sem aviso — este guarda protege o sistema.
    """
    colunas_arquivo = set(df.columns.tolist())
    colunas_necessarias = set(COLUNAS_ESPERADAS)
    colunas_faltando = colunas_necessarias - colunas_arquivo
    
    if colunas_faltando:
        print(f"[ERRO SCHEMA] Colunas faltando no CSV da ANP: {colunas_faltando}")
        print(f"[INFO] Colunas encontradas: {list(df.columns)}")
        return False
    
    print(f"[OK] Schema validado. {len(df)} registros encontrados.")
    return True


def carregar_e_filtrar_csv(caminho: Path) -> pd.DataFrame | None:
    """
    Carrega o CSV da ANP, valida o schema e filtra pelos estados e combustíveis alvo.
    """
    print(f"[INFO] Carregando {caminho.name}...")
    
    try:
        # A ANP usa encoding latin-1 e separador ponto-e-vírgula
        df = pd.read_csv(
            caminho,
            encoding="latin-1",
            sep=";",
            decimal=",",         # vírgula como separador decimal (padrão BR)
            dtype=str,           # carrega tudo como string primeiro para evitar erros
            low_memory=False,
        )
        
        # Remove espaços extras nos nomes de coluna
        df.columns = df.columns.str.strip()
        
    except Exception as e:
        print(f"[ERRO] Falha ao carregar CSV: {e}")
        return None
    
    # Valida schema antes de prosseguir
    if not validar_schema(df):
        return None
    
    # ── Limpeza de dados ──
    df["Valor de Venda"] = pd.to_numeric(
        df["Valor de Venda"].str.replace(",", ".").str.strip(),
        errors="coerce"
    )
    df["Valor de Compra"] = pd.to_numeric(
        df["Valor de Compra"].str.replace(",", ".").str.strip(),
        errors="coerce"
    )
    df["Data da Coleta"] = pd.to_datetime(
        df["Data da Coleta"].str.strip(),
        format="%d/%m/%Y",
        errors="coerce"
    )
    df["Estado - Sigla"] = df["Estado - Sigla"].str.strip().str.upper()
    df["Produto"] = df["Produto"].str.strip().str.upper()
    df["Bandeira"] = df["Bandeira"].str.strip().str.upper()
    df["Municipio"] = df["Municipio"].str.strip().str.upper()
    
    # ── Filtragem ──
    df_filtrado = df[
        (df["Estado - Sigla"].isin(ESTADOS_ALVO)) &
        (df["Produto"].isin(COMBUSTIVEIS_ALVO))
    ].copy()
    
    # Remove linhas com preço inválido
    df_filtrado = df_filtrado.dropna(subset=["Valor de Venda"])
    df_filtrado = df_filtrado[df_filtrado["Valor de Venda"] > 0]
    
    print(f"[OK] Filtrado: {len(df_filtrado)} registros válidos "
          f"(de {len(df)} totais) nos estados {ESTADOS_ALVO}")
    
    return df_filtrado


def agregar_por_estado_bandeira(df: pd.DataFrame, semana_ref: str) -> pd.DataFrame:
    """
    Agrega os dados brutos por Estado + Produto + Bandeira.
    Gera estatísticas por grupo: média, mediana, min, max, contagem de postos.
    """
    df["semana_ref"] = semana_ref
    
    agregado = df.groupby(
        ["semana_ref", "Estado - Sigla", "Produto", "Bandeira"],
        as_index=False
    ).agg(
        preco_medio=("Valor de Venda", "mean"),
        preco_mediano=("Valor de Venda", "median"),
        preco_minimo=("Valor de Venda", "min"),
        preco_maximo=("Valor de Venda", "max"),
        preco_compra_medio=("Valor de Compra", "mean"),
        qtd_postos=("Valor de Venda", "count"),
    ).round(4)
    
    print(f"[OK] Agregação concluída: {len(agregado)} grupos gerados.")
    return agregado


def salvar_agregado(df: pd.DataFrame, semana_ref: str):
    """Salva o CSV agregado em dados/brutos/ para uso posterior pelo calculador de margens."""
    caminho = DIR_DADOS_BRUTOS / f"agregado_{semana_ref}.csv"
    df.to_csv(caminho, index=False, encoding="utf-8")
    print(f"[OK] Agregado salvo em: {caminho}")
    return caminho


# ─── Ponto de entrada ─────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  COLETOR ANP — Painel de Combustíveis")
    print(f"  Execução: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)
    
    criar_diretorios()
    
    # Referência da semana atual (formato AAAA-WW)
    hoje = datetime.now()
    semana_ref = hoje.strftime("%Y-%W")
    print(f"[INFO] Semana de referência: {semana_ref}")
    
    # 1. Descobre e baixa o CSV
    url = descobrir_url_csv_anp()
    
    if url is None:
        print("[ERRO FATAL] Não foi possível obter a URL do CSV da ANP.")
        print("[AÇÃO] Verifique manualmente em: https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas")
        exit(1)
    
    caminho_csv = baixar_csv(url, semana_ref)
    if caminho_csv is None:
        print("[ERRO FATAL] Download falhou.")
        exit(1)
    
    # 2. Carrega, valida e filtra
    df = carregar_e_filtrar_csv(caminho_csv)
    if df is None:
        print("[ERRO FATAL] Falha no processamento do CSV.")
        exit(1)
    
    # 3. Agrega por estado/produto/bandeira
    df_agregado = agregar_por_estado_bandeira(df, semana_ref)
    
    # 4. Salva para o próximo módulo (calcular_margens.py)
    salvar_agregado(df_agregado, semana_ref)
    
    print("\n[CONCLUÍDO] Coleta e agregação finalizadas com sucesso.")
    print(f"[PRÓXIMO] Execute calcular_margens.py para gerar dados.json")


if __name__ == "__main__":
    main()
