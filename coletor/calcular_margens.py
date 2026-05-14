import json
import pandas as pd
import numpy as np
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)

# ─── Configurações ────────────────────────────────────────────────────────────
DIR_DADOS = Path(__file__).parent.parent / "dados"
ARQUIVO_ENTRADA = DIR_DADOS / "brutos" / "agregado_consolidado.csv"
ARQUIVO_SAIDA = DIR_DADOS / "dados.json"

# Idealmente, mova isso para um arquivo 'config_tributos.json'
TRIBUTOS_POR_ESTADO = {
    "SP": {"GASOLINA COMUM": 2.18, "ETANOL HIDRATADO": 0.52, "DIESEL": 1.42, "DIESEL S10": 1.45, "GASOLINA ADITIVADA": 2.18},
    "RJ": {"GASOLINA COMUM": 2.31, "ETANOL HIDRATADO": 0.55, "DIESEL": 1.51, "DIESEL S10": 1.54, "GASOLINA ADITIVADA": 2.31},
    "MG": {"GASOLINA COMUM": 2.09, "ETANOL HIDRATADO": 0.49, "DIESEL": 1.38, "DIESEL S10": 1.41, "GASOLINA ADITIVADA": 2.09},
    "RS": {"GASOLINA COMUM": 2.24, "ETANOL HIDRATADO": 0.52, "DIESEL": 1.46, "DIESEL S10": 1.49, "GASOLINA ADITIVADA": 2.24},
    "PR": {"GASOLINA COMUM": 2.21, "ETANOL HIDRATADO": 0.50, "DIESEL": 1.44, "DIESEL S10": 1.47, "GASOLINA ADITIVADA": 2.21},
    "BA": {"GASOLINA COMUM": 2.27, "ETANOL HIDRATADO": 0.54, "DIESEL": 1.48, "DIESEL S10": 1.51, "GASOLINA ADITIVADA": 2.27},
    "GO": {"GASOLINA COMUM": 2.15, "ETANOL HIDRATADO": 0.48, "DIESEL": 1.40, "DIESEL S10": 1.43, "GASOLINA ADITIVADA": 2.15},
    "DF": {"GASOLINA COMUM": 2.12, "ETANOL HIDRATADO": 0.51, "DIESEL": 1.39, "DIESEL S10": 1.42, "GASOLINA ADITIVADA": 2.12},
}

PRECO_PRODUTOR_REF = {
    "GASOLINA COMUM": 3.09,
    "ETANOL HIDRATADO": 2.85,
    "DIESEL": 3.45,
    "DIESEL S10": 3.52,
    "GASOLINA ADITIVADA": 3.09,
}

def calcular():
    if not ARQUIVO_ENTRADA.exists():
        logging.error("Arquivo consolidado não encontrado.")
        return

    df = pd.read_csv(ARQUIVO_ENTRADA, sep=';')
    
    # Limpeza de dados
    df['Valor de Venda'] = df['Valor de Venda'].str.replace(',', '.').astype(float)
    
    resultados = {
        "meta": {
            "ultima_atualizacao": pd.Timestamp.now().isoformat(),
            "semana_referencia": df['Data da Coleta'].max() if not df.empty else "N/A"
        },
        "estados": {}
    }

    for estado in df['Estado - Sigla'].unique():
        df_est = df[df['Estado - Sigla'] == estado]
        resultados["estados"][estado] = {}
        
        for produto in df_est['Produto'].unique():
            df_prod = df_est[df_est['Produto'] == produto]
            preco_medio = df_prod['Valor de Venda'].mean()
            
            # Cálculo de margem estimada
            trib = TRIBUTOS_POR_ESTADO.get(estado, {}).get(produto, 0)
            prod_ref = PRECO_PRODUTOR_REF.get(produto, 0)
            margem = preco_medio - trib - prod_ref
            
            resultados["estados"][estado][produto] = {
                "preco_medio": round(preco_medio, 3),
                "margem_estimada": round(margem, 3),
                "status": "normal" if margem < 1.2 else "alerta" # Exemplo de lógica simplificada
            }

    with open(ARQUIVO_SAIDA, 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    
    logging.info(f"JSON gerado em {ARQUIVO_SAIDA}")

if __name__ == "__main__":
    calcular()