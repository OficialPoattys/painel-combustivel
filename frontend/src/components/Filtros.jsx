const NOMES_PRODUTOS = {
  'GASOLINA COMUM':     'Gasolina Comum (C)',
  'ETANOL HIDRATADO':  'Etanol Hidratado',
  'GASOLINA ADITIVADA': 'Gasolina Aditivada',
}

const NOMES_ESTADOS = {
  SP: 'São Paulo', RJ: 'Rio de Janeiro', MG: 'Minas Gerais',
  RS: 'Rio Grande do Sul', PR: 'Paraná', BA: 'Bahia',
  GO: 'Goiás', DF: 'Distrito Federal',
}

export default function Filtros({ dados, estado, produto, onEstado, onProduto }) {
  if (!dados) return null

  const estados   = dados.meta?.estados_monitorados ?? []
  const produtos  = dados.meta?.combustiveis_monitorados ?? []

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500, marginRight: '2px' }}>Visualizando:</span>
      <select className="select-pill" value={estado} onChange={e => onEstado(e.target.value)}>
        {estados.map(uf => (
          <option key={uf} value={uf}>{NOMES_ESTADOS[uf] ?? uf} — {uf}</option>
        ))}
      </select>
      <select className="select-pill" value={produto} onChange={e => onProduto(e.target.value)}>
        {produtos.map(p => (
          <option key={p} value={p}>{NOMES_PRODUTOS[p] ?? p}</option>
        ))}
      </select>
    </div>
  );
}