"""
calcular_margens.py
Lê os CSVs agregados das últimas semanas, calcula margens brutas,
compara com histórico e gera alertas. Produz o dados.json final.
"""

import json
import glob
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path

# ─── Configurações ────────────────────────────────────────────────────────────

DIR_DADOS_BRUTOS = Path(__file__).parent.parent / "dados" / "brutos"
DIR_DADOS = Path(__file__).parent.parent / "dados"
ARQUIVO_SAIDA = DIR_DADOS / "dados.json"

# Janela histórica para cálculo da margem "normal"
SEMANAS_HISTORICO = 12

# Threshold de anomalia: se a margem sobe mais que X% acima da média histórica
THRESHOLD_ANOMALIA_PCT = 15.0   # 🔴 vermelho
THRESHOLD_ATENCAO_PCT  = 7.0    # 🟡 amarelo

# Peso estimado de tributos por estado (ICMS + federais, em R$/litro)
# Fonte: ANP - Composição de Preços (atualizar mensalmente)
# Valores aproximados para v1 — será refinado com dados reais da ANP
TRIBUTOS_POR_ESTADO = {
    "SP": {"GASOLINA": 2.18, "ETANOL": 0.52, "DIESEL": 1.42, "DIESEL S10": 1.45},
    "RJ": {"GASOLINA": 2.31, "ETANOL": 0.55, "DIESEL": 1.51, "DIESEL S10": 1.54},
    "MG": {"GASOLINA": 2.09, "ETANOL": 0.49, "DIESEL": 1.38, "DIESEL S10": 1.41},
    "RS": {"GASOLINA": 2.24, "ETANOL": 0.52, "DIESEL": 1.46, "DIESEL S10": 1.49},
    "PR": {"GASOLINA": 2.21, "ETANOL": 0.50, "DIESEL": 1.44, "DIESEL S10": 1.47},
    "BA": {"GASOLINA": 2.27, "ETANOL": 0.54, "DIESEL": 1.48, "DIESEL S10": 1.51},
    "GO": {"GASOLINA": 2.15, "ETANOL": 0.48, "DIESEL": 1.40, "DIESEL S10": 1.43},
    "DF": {"GASOLINA": 2.12, "ETANOL": 0.51, "DIESEL": 1.39, "DIESEL S10": 1.42},
}

# Preço de referência do produtor/importador (Petrobras + média importadores)
# Fonte: ANP - Preços de Produtores e Importadores
# IMPORTANTE: Este dicionário deve ser atualizado pelo coletor quando a ANP publicar novos dados
# Por ora, usamos valores de referência para v1 (R$/litro na porta da refinaria)
PRECO_PRODUTOR_REFERENCIA = {
    "GASOLINA":    3.09,  # Gasolina A — base Petrobras (atualizar mensalmente)
    "ETANOL":      2.85,  # Preço médio na usina
    "DIESEL":      3.45,  # Diesel A na porta da refinaria
    "DIESEL S10":  3.52,  # Diesel A S10 na porta da refinaria
}

# ─── Funções principais ───────────────────────────────────────────────────────

def carregar_historico() -> pd.DataFrame:
    """
    Carrega o CSV consolidado gerado pelo coletar.py.
    """
    caminho = DIR_DADOS_BRUTOS / "agregado_consolidado.csv"

    if not caminho.exists():
        print("[AVISO] agregado_consolidado.csv não encontrado. Execute coletar.py primeiro.")
        return pd.DataFrame()

    try:
        df = pd.read_csv(caminho)
        print(f"[OK] Histórico carregado: {len(df)} registros · {df['semana_ref'].nunique()} semanas.")
        return df
    except Exception as e:
        print(f"[ERRO] Falha ao carregar histórico: {e}")
        return pd.DataFrame()


def calcular_margem_bruta(preco_bomba: float, estado: str, produto: str) -> float:
    """
    Calcula a margem bruta estimada de distribuição + revenda.
    
    Fórmula:
    Margem = Preço Bomba - Preço Produtor - Tributos Estimados
    
    Esta é uma estimativa. A margem real inclui frete e blending (etanol/biodiesel),
    que serão refinados em v2 com dados granulares da ANP.
    """
    preco_produtor = PRECO_PRODUTOR_REFERENCIA.get(produto, 0)
    tributos = TRIBUTOS_POR_ESTADO.get(estado, {}).get(produto, 0)
    
    margem = preco_bomba - preco_produtor - tributos
    return round(margem, 4)


def calcular_baseline_historico(df_hist: pd.DataFrame) -> pd.DataFrame:
    """
    Calcula a margem média histórica por Estado + Produto + Bandeira
    para servir como linha de base dos alertas.
    """
    if df_hist.empty:
        return pd.DataFrame()
    
    # Calcula margem bruta para todo o histórico
    df_hist = df_hist.copy()
    df_hist["margem_bruta"] = df_hist.apply(
        lambda r: calcular_margem_bruta(
            r["preco_medio"],
            r["Estado - Sigla"],
            r["Produto"]
        ), axis=1
    )
    
    baseline = df_hist.groupby(
        ["Estado - Sigla", "Produto", "Bandeira"],
        as_index=False
    ).agg(
        margem_media_hist=("margem_bruta", "mean"),
        margem_std_hist=("margem_bruta", "std"),
        preco_medio_hist=("preco_medio", "mean"),
        semanas_com_dados=("semana_ref", "nunique"),
    ).round(4)
    
    # Preenche NaN no std (acontece quando há apenas 1 semana de dados)
    baseline["margem_std_hist"] = baseline["margem_std_hist"].fillna(0)
    
    print(f"[OK] Baseline histórico calculado: {len(baseline)} grupos.")
    return baseline


def classificar_alerta(margem_atual: float, margem_media_hist: float) -> dict:
    """
    Compara a margem atual com a média histórica e retorna o nível de alerta.
    
    Retorna:
        {
            "nivel": "normal" | "atencao" | "anomalia",
            "cor": "verde" | "amarelo" | "vermelho",
            "variacao_pct": float,
            "descricao": str
        }
    """
    if margem_media_hist == 0:
        return {
            "nivel": "sem_dados",
            "cor": "cinza",
            "variacao_pct": 0,
            "descricao": "Histórico insuficiente para análise."
        }
    
    variacao_pct = ((margem_atual - margem_media_hist) / abs(margem_media_hist)) * 100
    variacao_pct = round(variacao_pct, 2)
    
    if variacao_pct >= THRESHOLD_ANOMALIA_PCT:
        return {
            "nivel": "anomalia",
            "cor": "vermelho",
            "variacao_pct": variacao_pct,
            "descricao": f"Margem {variacao_pct:.1f}% acima da média histórica. Possível repasse excessivo."
        }
    elif variacao_pct >= THRESHOLD_ATENCAO_PCT:
        return {
            "nivel": "atencao",
            "cor": "amarelo",
            "variacao_pct": variacao_pct,
            "descricao": f"Margem {variacao_pct:.1f}% acima da média. Monitorar evolução."
        }
    elif variacao_pct <= -THRESHOLD_ATENCAO_PCT:
        return {
            "nivel": "favoravel",
            "cor": "verde",
            "variacao_pct": variacao_pct,
            "descricao": f"Margem {abs(variacao_pct):.1f}% abaixo da média. Bom momento para o consumidor."
        }
    else:
        return {
            "nivel": "normal",
            "cor": "verde",
            "variacao_pct": variacao_pct,
            "descricao": "Margem dentro da faixa histórica normal."
        }


def gerar_serie_historica(df_hist: pd.DataFrame, estado: str, produto: str) -> list:
    """
    Gera a série histórica de preços e margens para um estado+produto.
    Usado para alimentar os gráficos de linha do painel.
    """
    if df_hist.empty:
        return []
    
    filtro = (
        (df_hist["Estado - Sigla"] == estado) &
        (df_hist["Produto"] == produto)
    )
    df_filtrado = df_hist[filtro].copy()
    
    if df_filtrado.empty:
        return []
    
    df_filtrado["margem_bruta"] = df_filtrado.apply(
        lambda r: calcular_margem_bruta(r["preco_medio"], estado, produto),
        axis=1
    )
    
    # Agrupa por semana (média de todas as bandeiras)
    serie = df_filtrado.groupby("semana_ref", as_index=False).agg(
        preco_medio=("preco_medio", "mean"),
        margem_bruta=("margem_bruta", "mean"),
    ).round(4)
    
    serie = serie.sort_values("semana_ref")
    
    return serie.to_dict(orient="records")


def montar_dados_json(df_atual: pd.DataFrame, df_hist: pd.DataFrame, baseline: pd.DataFrame) -> dict:
    """
    Monta o objeto JSON final que alimenta o frontend.
    """
    semana_ref = df_atual["semana_ref"].iloc[0] if not df_atual.empty else "N/A"
    
    # Adiciona margem bruta ao df atual
    df_atual = df_atual.copy()
    df_atual["margem_bruta"] = df_atual.apply(
        lambda r: calcular_margem_bruta(
            r["preco_medio"],
            r["Estado - Sigla"],
            r["Produto"]
        ), axis=1
    )
    
    # Junta com baseline
    if not baseline.empty:
        df_atual = df_atual.merge(
            baseline[["Estado - Sigla", "Produto", "Bandeira", "margem_media_hist", "preco_medio_hist"]],
            on=["Estado - Sigla", "Produto", "Bandeira"],
            how="left"
        )
    else:
        df_atual["margem_media_hist"] = 0
        df_atual["preco_medio_hist"] = 0
    
    df_atual["margem_media_hist"] = df_atual["margem_media_hist"].fillna(0)
    df_atual["preco_medio_hist"] = df_atual["preco_medio_hist"].fillna(0)
    
    # ── Estrutura do JSON ──
    resultado = {
        "meta": {
            "semana_referencia": semana_ref,
            "gerado_em": datetime.now().isoformat(),
            "fonte": "ANP - Levantamento de Preços de Combustíveis",
            "metodologia_url": "/metodologia",
            "estados_monitorados": list(df_atual["Estado - Sigla"].unique()),
            "combustiveis_monitorados": list(df_atual["Produto"].unique()),
            "threshold_anomalia_pct": THRESHOLD_ANOMALIA_PCT,
            "threshold_atencao_pct": THRESHOLD_ATENCAO_PCT,
            "semanas_historico_usadas": SEMANAS_HISTORICO,
        },
        "resumo_nacional": {},
        "por_estado": {},
        "series_historicas": {},
        "alertas": [],
    }
    
    # ── Resumo nacional (média de todos os estados monitorados) ──
    for produto in df_atual["Produto"].unique():
        df_prod = df_atual[df_atual["Produto"] == produto]
        resultado["resumo_nacional"][produto] = {
            "preco_medio_nacional": round(df_prod["preco_medio"].mean(), 4),
            "preco_minimo_nacional": round(df_prod["preco_minimo"].min(), 4),
            "preco_maximo_nacional": round(df_prod["preco_maximo"].max(), 4),
            "variacao_vs_semana_anterior": round(
                df_prod["preco_medio"].mean() - df_prod["preco_medio_hist"].mean(), 4
            ),
        }
    
    # ── Por estado ──
    for estado in df_atual["Estado - Sigla"].unique():
        resultado["por_estado"][estado] = {}
        df_estado = df_atual[df_atual["Estado - Sigla"] == estado]
        
        for produto in df_estado["Produto"].unique():
            df_ep = df_estado[df_estado["Produto"] == produto]
            resultado["por_estado"][estado][produto] = {
                "preco_medio": round(df_ep["preco_medio"].mean(), 4),
                "preco_mediano": round(df_ep["preco_mediano"].mean(), 4),
                "preco_minimo": round(df_ep["preco_minimo"].min(), 4),
                "preco_maximo": round(df_ep["preco_maximo"].max(), 4),
                "margem_bruta_media": round(df_ep["margem_bruta"].mean(), 4),
                "variacao_vs_semana_anterior": round(
                    df_ep["preco_medio"].mean() - df_ep["preco_medio_hist"].mean(), 4
                ),
                "por_bandeira": [],
            }
            
            # Por bandeira dentro do estado+produto
            for _, linha in df_ep.iterrows():
                alerta = classificar_alerta(
                    linha["margem_bruta"],
                    linha.get("margem_media_hist", 0)
                )
                
                entrada_bandeira = {
                    "bandeira": linha["Bandeira"],
                    "preco_medio": round(linha["preco_medio"], 4),
                    "preco_mediano": round(linha["preco_mediano"], 4),
                    "preco_minimo": round(linha["preco_minimo"], 4),
                    "preco_maximo": round(linha["preco_maximo"], 4),
                    "margem_bruta": round(linha["margem_bruta"], 4),
                    "qtd_postos": int(linha["qtd_postos"]),
                    "alerta": alerta,
                }
                
                resultado["por_estado"][estado][produto]["por_bandeira"].append(entrada_bandeira)
                
                # Registra no array global de alertas se for anomalia ou atenção
                if alerta["nivel"] in ["anomalia", "atencao"]:
                    resultado["alertas"].append({
                        "estado": estado,
                        "produto": produto,
                        "bandeira": linha["Bandeira"],
                        "nivel": alerta["nivel"],
                        "cor": alerta["cor"],
                        "variacao_pct": alerta["variacao_pct"],
                        "descricao": alerta["descricao"],
                        "preco_atual": round(linha["preco_medio"], 4),
                        "margem_atual": round(linha["margem_bruta"], 4),
                    })
        
        # Séries históricas por estado+produto
        resultado["series_historicas"][estado] = {}
        for produto in df_estado["Produto"].unique():
            serie = gerar_serie_historica(df_hist, estado, produto)
            resultado["series_historicas"][estado][produto] = serie
    
    # Ordena alertas: anomalias primeiro, depois atenção
    resultado["alertas"].sort(
        key=lambda x: (0 if x["nivel"] == "anomalia" else 1, -x["variacao_pct"])
    )
    
    return resultado


def salvar_json(dados: dict):
    """Salva o dados.json final (lido pelo frontend)."""
    with open(ARQUIVO_SAIDA, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2, default=str)
    
    tamanho_kb = ARQUIVO_SAIDA.stat().st_size / 1024
    print(f"[OK] dados.json gerado: {ARQUIVO_SAIDA} ({tamanho_kb:.1f} KB)")


# ─── Ponto de entrada ─────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  CALCULADOR DE MARGENS — Painel de Combustíveis")
    print(f"  Execução: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)
    
    # 1. Carrega todo o histórico disponível
    df_hist = carregar_historico()
    
    if df_hist.empty:
        print("[ERRO FATAL] Nenhum dado histórico disponível.")
        print("[AÇÃO] Execute coletar.py primeiro.")
        exit(1)
    
    # 2. Isola a semana mais recente como "semana atual"
    semana_mais_recente = df_hist["semana_ref"].max()
    df_atual = df_hist[df_hist["semana_ref"] == semana_mais_recente].copy()
    df_hist_passado = df_hist[df_hist["semana_ref"] != semana_mais_recente].copy()
    
    print(f"[INFO] Semana atual: {semana_mais_recente}")
    print(f"[INFO] Semanas no histórico (excl. atual): {df_hist_passado['semana_ref'].nunique()}")
    
    # 3. Calcula baseline histórico
    baseline = calcular_baseline_historico(df_hist_passado)
    
    # 4. Monta o JSON final
    dados = montar_dados_json(df_atual, df_hist, baseline)
    
    # 5. Salva
    salvar_json(dados)
    
    # 6. Resumo dos alertas
    n_anomalias = sum(1 for a in dados["alertas"] if a["nivel"] == "anomalia")
    n_atencao = sum(1 for a in dados["alertas"] if a["nivel"] == "atencao")
    print(f"\n[RESUMO] {n_anomalias} anomalias 🔴 | {n_atencao} atenções 🟡 detectadas.")
    print("[CONCLUÍDO] dados.json pronto para o frontend.")


if __name__ == "__main__":
    main()
