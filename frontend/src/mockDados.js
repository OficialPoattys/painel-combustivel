/*
  mockDados.js
  Dados de exemplo que espelham exatamente a estrutura do dados.json
  gerado por calcular_margens.py. Usado como fallback no ambiente de
  desenvolvimento enquanto o coletor ainda não rodou.
*/

const gerarSerie = (precoBase, semanas = 12) => {
  const serie = []
  const hoje = new Date()
  let preco = precoBase
  for (let i = semanas - 1; i >= 0; i--) {
    const data = new Date(hoje)
    data.setDate(data.getDate() - i * 7)
    const ano = data.getFullYear()
    const semana = String(Math.ceil((data - new Date(data.getFullYear(), 0, 1)) / (7 * 86400000))).padStart(2, '0')
    preco = +(preco + (Math.random() - 0.48) * 0.07).toFixed(4)
    serie.push({
      semana_ref: `${ano}-${semana}`,
      preco_medio: preco,
      margem_bruta: +(preco - 3.09 - 2.18 + (Math.random() - 0.5) * 0.1).toFixed(4),
    })
  }
  return serie
}

const bandeirasBase = (precoMedio, estado) => {
  const tributos = {
    SP: 2.18, RJ: 2.31, MG: 2.09, RS: 2.24,
    PR: 2.21, BA: 2.27, GO: 2.15, DF: 2.12,
  }
  const produtor = 3.09
  const t = tributos[estado] ?? 2.18

  return [
    {
      bandeira: 'VIBRA',
      preco_medio: +(precoMedio - 0.02).toFixed(4),
      preco_mediano: +(precoMedio - 0.02).toFixed(4),
      preco_minimo: +(precoMedio - 0.37).toFixed(4),
      preco_maximo: +(precoMedio + 0.23).toFixed(4),
      margem_bruta: +(precoMedio - 0.02 - produtor - t).toFixed(4),
      qtd_postos: 1234,
      alerta: { nivel: 'normal', cor: 'verde', variacao_pct: -2.1, descricao: 'Margem dentro da faixa histórica normal.' },
    },
    {
      bandeira: 'IPIRANGA',
      preco_medio: +(precoMedio + 0.07).toFixed(4),
      preco_mediano: +(precoMedio + 0.07).toFixed(4),
      preco_minimo: +(precoMedio - 0.31).toFixed(4),
      preco_maximo: +(precoMedio + 0.39).toFixed(4),
      margem_bruta: +(precoMedio + 0.07 - produtor - t).toFixed(4),
      qtd_postos: 987,
      alerta: { nivel: 'anomalia', cor: 'vermelho', variacao_pct: 18.3, descricao: 'Margem 18,3% acima da média histórica. Possível repasse excessivo.' },
    },
    {
      bandeira: 'RAIZEN',
      preco_medio: +(precoMedio + 0.02).toFixed(4),
      preco_mediano: +(precoMedio + 0.01).toFixed(4),
      preco_minimo: +(precoMedio - 0.33).toFixed(4),
      preco_maximo: +(precoMedio + 0.26).toFixed(4),
      margem_bruta: +(precoMedio + 0.02 - produtor - t).toFixed(4),
      qtd_postos: 654,
      alerta: { nivel: 'atencao', cor: 'amarelo', variacao_pct: 9.1, descricao: 'Margem 9,1% acima da média. Monitorar evolução.' },
    },
    {
      bandeira: 'BRANCA',
      preco_medio: +(precoMedio - 0.11).toFixed(4),
      preco_mediano: +(precoMedio - 0.14).toFixed(4),
      preco_minimo: +(precoMedio - 0.70).toFixed(4),
      preco_maximo: +(precoMedio + 0.27).toFixed(4),
      margem_bruta: +(precoMedio - 0.11 - produtor - t).toFixed(4),
      qtd_postos: 2345,
      alerta: { nivel: 'normal', cor: 'verde', variacao_pct: -3.5, descricao: 'Margem dentro da faixa histórica normal.' },
    },
  ]
}

const estadosDados = (estados, precos) => {
  const resultado = {}
  estados.forEach((uf, i) => {
    const pGas = precos[i]
    const pEta = +(pGas * 0.667).toFixed(4)
    resultado[uf] = {
      'GASOLINA COMUM': {
        preco_medio: pGas,
        preco_mediano: pGas,
        preco_minimo: +(pGas - 0.70).toFixed(4),
        preco_maximo: +(pGas + 0.56).toFixed(4),
        margem_bruta_media: +(pGas - 3.09 - 2.18).toFixed(4),
        variacao_vs_semana_anterior: +((Math.random() - 0.45) * 0.12).toFixed(4),
        por_bandeira: bandeirasBase(pGas, uf),
      },
      'ETANOL HIDRATADO': {
        preco_medio: pEta,
        preco_mediano: pEta,
        preco_minimo: +(pEta - 0.50).toFixed(4),
        preco_maximo: +(pEta + 0.43).toFixed(4),
        margem_bruta_media: +(pEta - 2.85 - 0.52).toFixed(4),
        variacao_vs_semana_anterior: +((Math.random() - 0.55) * 0.10).toFixed(4),
        por_bandeira: bandeirasBase(pEta, uf).map(b => ({ ...b, alerta: { nivel: 'normal', cor: 'verde', variacao_pct: -1.2, descricao: 'Margem dentro da faixa histórica normal.' } })),
      },
      'GASOLINA ADITIVADA': {
        preco_medio: +(pGas + 0.23).toFixed(4),
        preco_mediano: +(pGas + 0.22).toFixed(4),
        preco_minimo: +(pGas - 0.47).toFixed(4),
        preco_maximo: +(pGas + 0.77).toFixed(4),
        margem_bruta_media: +(pGas + 0.23 - 3.09 - 2.18).toFixed(4),
        variacao_vs_semana_anterior: +((Math.random() - 0.45) * 0.13).toFixed(4),
        por_bandeira: bandeirasBase(+(pGas + 0.23).toFixed(4), uf),
      },
    }
  })
  return resultado
}

const ESTADOS = ['SP', 'RJ', 'MG', 'RS', 'PR', 'BA', 'GO', 'DF']
const PRECOS  = [5.89, 6.12, 5.74, 5.81, 5.68, 6.03, 5.71, 5.77]

export const mockDados = {
  meta: {
    semana_referencia: '2025-20',
    gerado_em: new Date().toISOString(),
    fonte: 'ANP – Levantamento de Preços de Combustíveis',
    metodologia_url: '/metodologia',
    estados_monitorados: ESTADOS,
    combustiveis_monitorados: ['GASOLINA COMUM', 'ETANOL HIDRATADO', 'GASOLINA ADITIVADA'],
    threshold_anomalia_pct: 15.0,
    threshold_atencao_pct: 7.0,
    semanas_historico_usadas: 12,
  },

  resumo_nacional: {
    'GASOLINA COMUM': {
      preco_medio_nacional: 5.89,
      preco_minimo_nacional: 5.19,
      preco_maximo_nacional: 6.45,
      variacao_vs_semana_anterior: 0.03,
    },
    'ETANOL HIDRATADO': {
      preco_medio_nacional: 3.92,
      preco_minimo_nacional: 3.45,
      preco_maximo_nacional: 4.35,
      variacao_vs_semana_anterior: -0.08,
    },
    'GASOLINA ADITIVADA': {
      preco_medio_nacional: 6.12,
      preco_minimo_nacional: 5.52,
      preco_maximo_nacional: 6.89,
      variacao_vs_semana_anterior: 0.04,
    },
  },

  por_estado: estadosDados(ESTADOS, PRECOS),

  series_historicas: {
    SP: {
      'GASOLINA COMUM':     gerarSerie(5.75),
      'ETANOL HIDRATADO':   gerarSerie(3.82),
      'GASOLINA ADITIVADA': gerarSerie(5.98),
    },
    RJ: {
      'GASOLINA COMUM':     gerarSerie(6.00),
      'ETANOL HIDRATADO':   gerarSerie(4.01),
      'GASOLINA ADITIVADA': gerarSerie(6.24),
    },
    MG: {
      'GASOLINA COMUM':     gerarSerie(5.62),
      'ETANOL HIDRATADO':   gerarSerie(3.75),
      'GASOLINA ADITIVADA': gerarSerie(5.85),
    },
    RS: { 'GASOLINA COMUM': gerarSerie(5.70), 'ETANOL HIDRATADO': gerarSerie(3.80), 'GASOLINA ADITIVADA': gerarSerie(5.93) },
    PR: { 'GASOLINA COMUM': gerarSerie(5.57), 'ETANOL HIDRATADO': gerarSerie(3.70), 'GASOLINA ADITIVADA': gerarSerie(5.80) },
    BA: { 'GASOLINA COMUM': gerarSerie(5.94), 'ETANOL HIDRATADO': gerarSerie(3.96), 'GASOLINA ADITIVADA': gerarSerie(6.17) },
    GO: { 'GASOLINA COMUM': gerarSerie(5.60), 'ETANOL HIDRATADO': gerarSerie(3.73), 'GASOLINA ADITIVADA': gerarSerie(5.83) },
    DF: { 'GASOLINA COMUM': gerarSerie(5.66), 'ETANOL HIDRATADO': gerarSerie(3.78), 'GASOLINA ADITIVADA': gerarSerie(5.89) },
  },

  alertas: [
    { estado: 'SP', produto: 'GASOLINA COMUM',     bandeira: 'IPIRANGA', nivel: 'anomalia', cor: 'vermelho', variacao_pct: 18.3, descricao: 'Margem 18,3% acima da média histórica. Possível repasse excessivo.', preco_atual: 5.96, margem_atual: 1.62 },
    { estado: 'RJ', produto: 'GASOLINA COMUM',     bandeira: 'VIBRA',    nivel: 'anomalia', cor: 'vermelho', variacao_pct: 15.7, descricao: 'Margem 15,7% acima da média histórica. Possível repasse excessivo.', preco_atual: 6.19, margem_atual: 1.71 },
    { estado: 'SP', produto: 'GASOLINA COMUM',     bandeira: 'RAIZEN',   nivel: 'atencao',  cor: 'amarelo',  variacao_pct: 9.1,  descricao: 'Margem 9,1% acima da média. Monitorar evolução.',               preco_atual: 5.91, margem_atual: 1.48 },
    { estado: 'MG', produto: 'ETANOL HIDRATADO',   bandeira: 'IPIRANGA', nivel: 'atencao',  cor: 'amarelo',  variacao_pct: 7.4,  descricao: 'Margem 7,4% acima da média. Monitorar evolução.',               preco_atual: 3.98, margem_atual: 0.61 },
    { estado: 'BA', produto: 'GASOLINA ADITIVADA', bandeira: 'RAIZEN',   nivel: 'atencao',  cor: 'amarelo',  variacao_pct: 7.9,  descricao: 'Margem 7,9% acima da média. Monitorar evolução.',               preco_atual: 6.41, margem_atual: 1.14 },
  ],
}
