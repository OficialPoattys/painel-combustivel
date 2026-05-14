import requests
import pandas as pd
import time
from datetime import datetime
from pathlib import Path
import logging

# Configuração de Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ─── Configurações ────────────────────────────────────────────────────────────
ESTADOS_ALVO = ["SP", "RJ", "MG", "RS", "PR", "BA", "GO", "DF"]
COMBUSTIVEIS_ALVO = [
    "GASOLINA COMUM",
    "ETANOL HIDRATADO",
    "DIESEL",
    "DIESEL S10",
    "GASOLINA ADITIVADA",
]

URLS_SEMANAIS = [
    "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/qus/ultimas-4-semanas-gasolina-etanol.csv",
    "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/shpc/qus/ultimas-4-semanas-diesel-gnv.csv",
]

DIR_DADOS_BRUTOS = Path(__file__).parent.parent / "dados" / "brutos"
COLUNAS_OBRIGATORIAS = [
    "Estado - Sigla", "Produto", "Data da Coleta", "Valor de Venda", "Bandeira"
]

def baixar_com_retry(url, max_retries=3):
    for i in range(max_retries):
        try:
            resp = requests.get(url, timeout=60)
            resp.raise_for_status()
            return resp
        except Exception as e:
            logging.error(f"Erro ao baixar {url} (tentativa {i+1}): {e}")
            time.sleep(5)
    return None

def processar_e_validar(caminho_csv):
    try:
        # Tenta ler com separador ponto e vírgula (padrão ANP)
        df = pd.read_csv(caminho_csv, sep=';', encoding='utf-8')
        
        # Validação de colunas
        missing = [col for col in COLUNAS_OBRIGATORIAS if col not in df.columns]
        if missing:
            logging.error(f"Arquivo {caminho_csv.name} inválido. Colunas faltando: {missing}")
            return None
            
        # Filtros básicos
        df = df[df['Estado - Sigla'].isin(ESTADOS_ALVO)]
        df = df[df['Produto'].isin(COMBUSTIVEIS_ALVO)]
        
        return df
    except Exception as e:
        logging.error(f"Erro ao processar {caminho_csv.name}: {e}")
        return None

def executar():
    DIR_DADOS_BRUTOS.mkdir(parents=True, exist_ok=True)
    dfs = []
    
    for url in URLS_SEMANAIS:
        nome_arq = url.split('/')[-1]
        caminho = DIR_DADOS_BRUTOS / nome_arq
        
        resp = baixar_com_retry(url)
        if resp:
            with open(caminho, 'wb') as f:
                f.write(resp.content)
            
            df = processar_e_validar(caminho)
            if df is not None:
                dfs.append(df)
    
    if dfs:
        consolidado = pd.concat(dfs, ignore_index=True)
        consolidado.to_csv(DIR_DADOS_BRUTOS / "agregado_consolidado.csv", index=False, sep=';')
        logging.info("Coleta e consolidação concluídas com sucesso.")
    else:
        logging.error("Nenhum dado válido foi coletado.")

if __name__ == "__main__":
    executar()