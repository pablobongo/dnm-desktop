// StoricoPage.jsx — tabella completa storico giornate
import { useState, useMemo } from 'react';
import { formatData, giornoSettimana } from './store';

export default function StoricoPage({ dati }) {
  const [filtro, setFiltro] = useState('');
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const righePerPagina = 20;

  const datiFiltrati = useMemo(() => {
    let rows = [...dati].reverse(); // più recenti prima
    if (filtro) rows = rows.filter(r => r.data?.includes(filtro));
    return rows;
  }, [dati, filtro]);

  const totalePagine = Math.ceil(datiFiltrati.length / righePerPagina);
  const righeVisibili = datiFiltrati.slice((paginaCorrente - 1) * righePerPagina, paginaCorrente * righePerPagina);

  const badge = (val) => {
    if (!val) return <span className="text-muted">—</span>;
    return <span className={`badge badge--${val}`}>{val === 'si' ? '✓' : val === 'no' ? '✗' : '~'}</span>;
  };

  const num = (val) => val && parseFloat(val) > 0 ? parseFloat(val) : null;

  if (!dati.length) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
        <div className="fw-bold" style={{ fontSize: 20 }}>Nessun dato da mostrare</div>
        <div className="text-muted mt-8">Sincronizza i dati dal Google Sheet nelle Impostazioni.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-24">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Storico giornate</h1>
        <div className="flex gap-8">
          <input
            type="month"
            className="input"
            style={{ width: 'auto', colorScheme: 'dark' }}
            onChange={e => { setFiltro(e.target.value); setPaginaCorrente(1); }}
          />
          <span className="text-muted text-sm" style={{ alignSelf: 'center' }}>
            {datiFiltrati.length} giornate
          </span>
        </div>
      </div>

      {/* Tabella pasti */}
      <div className="card mb-24">
        <div className="section-title">Pasti e macro</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colazione</th>
                <th>Post-all.</th>
                <th>Spuntino</th>
                <th>Cena</th>
                <th>Extra</th>
                <th>Kcal tot.</th>
                <th>P (g)</th>
                <th>C (g)</th>
                <th>G (g)</th>
                <th>Energia</th>
              </tr>
            </thead>
            <tbody>
              {righeVisibili.map((r, i) => (
                <tr key={i}>
                  <td className="td-main" style={{ whiteSpace: 'nowrap' }}>
                    {giornoSettimana(r.data)} {formatData(r.data)}
                  </td>
                  <td>{badge(r.colazione_fatta)}</td>
                  <td>{badge(r.post_all_fatto)}</td>
                  <td>{badge(r.spuntino_fatto)}</td>
                  <td>
                    {r.cena_id && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>{r.cena_id}</span>}
                    {badge(r.cena_fatta)}
                  </td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.extra || <span className="text-muted">—</span>}
                  </td>
                  <td className="td-main">{num(r.totale_kcal) ?? '—'}</td>
                  <td>{num(r.totale_p) ?? '—'}</td>
                  <td>{num(r.totale_c) ?? '—'}</td>
                  <td>{num(r.totale_g) ?? '—'}</td>
                  <td>{r.energia ? '★'.repeat(parseInt(r.energia)) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabella bilancia */}
      <div className="card mb-24">
        <div className="section-title">Dati bilancia</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso (kg)</th>
                <th>BMI</th>
                <th>BMR</th>
                <th>Grasso %</th>
                <th>Massa grassa</th>
                <th>Muscolo %</th>
                <th>Massa musc.</th>
                <th>Acqua %</th>
                <th>Massa prot.</th>
                <th>Grasso visc.</th>
                <th>Vita/Fianchi</th>
              </tr>
            </thead>
            <tbody>
              {righeVisibili.filter(r => num(r.peso_kg)).map((r, i) => (
                <tr key={i}>
                  <td className="td-main" style={{ whiteSpace: 'nowrap' }}>
                    {giornoSettimana(r.data)} {formatData(r.data)}
                  </td>
                  <td className="td-main">{num(r.peso_kg) ?? '—'}</td>
                  <td>{num(r.bmi) ?? '—'}</td>
                  <td>{num(r.bmr) ?? '—'}</td>
                  <td>{num(r.grasso_pct) != null ? `${num(r.grasso_pct)}%` : '—'}</td>
                  <td>{num(r.massa_grassa_kg) != null ? `${num(r.massa_grassa_kg)} kg` : '—'}</td>
                  <td>{num(r.muscolo_pct) != null ? `${num(r.muscolo_pct)}%` : '—'}</td>
                  <td>{num(r.massa_muscolare_kg) != null ? `${num(r.massa_muscolare_kg)} kg` : '—'}</td>
                  <td>{num(r.acqua_pct) != null ? `${num(r.acqua_pct)}%` : '—'}</td>
                  <td>{num(r.massa_proteica_kg) != null ? `${num(r.massa_proteica_kg)} kg` : '—'}</td>
                  <td>{num(r.grasso_viscerale) ?? '—'}</td>
                  <td>{num(r.rapporto_vita_fianchi) ?? '—'}</td>
                </tr>
              ))}
              {!righeVisibili.filter(r => num(r.peso_kg)).length && (
                <tr><td colSpan={12} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Nessun dato bilancia in questo periodo</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginazione */}
      {totalePagine > 1 && (
        <div className="flex-center gap-8">
          <button className="btn btn--ghost btn--sm" onClick={() => setPaginaCorrente(p => Math.max(1, p - 1))} disabled={paginaCorrente === 1}>← Prec.</button>
          <span className="text-muted text-sm">Pag. {paginaCorrente} / {totalePagine}</span>
          <button className="btn btn--ghost btn--sm" onClick={() => setPaginaCorrente(p => Math.min(totalePagine, p + 1))} disabled={paginaCorrente === totalePagine}>Succ. →</button>
        </div>
      )}
    </div>
  );
}
