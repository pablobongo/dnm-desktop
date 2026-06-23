// StoricoPage.jsx — tabella completa storico giornate
import { useState, useMemo } from 'react';
import { formatData, giornoSettimana } from './store';

const isWeekend = (dataStr) => {
  if (!dataStr) return false;
  const d = new Date(dataStr + 'T12:00:00').getDay();
  return d === 0 || d === 6;
};

const renderEnergia = (val) => {
  if (val === null || val === undefined || val === '') return '—';
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return '—';
  // scala 0-1 (es. 0.9) → converte in stelle su 5
  const stelle = n <= 1 ? Math.round(n * 5) : Math.min(5, Math.round(n));
  return stelle > 0 ? '★'.repeat(stelle) : '—';
};

export default function StoricoPage({ dati }) {
  const [filtro, setFiltro] = useState('');
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const [rigaDettaglio, setRigaDettaglio] = useState(null);
  const righePerPagina = 20;

  const datiFiltrati = useMemo(() => {
    let rows = [...dati].reverse();
    if (filtro) rows = rows.filter(r => r.data?.includes(filtro));
    return rows;
  }, [dati, filtro]);

  const totalePagine = Math.ceil(datiFiltrati.length / righePerPagina);
  const righeVisibili = datiFiltrati.slice((paginaCorrente - 1) * righePerPagina, paginaCorrente * righePerPagina);

  const badge = (val) => {
    if (!val) return <span className="text-muted">—</span>;
    return <span className={`badge badge--${val === 'si' ? 'si' : val === 'no' ? 'no' : 'mod'}`}>{val === 'si' ? '✓' : val === 'no' ? '✗' : '~'}</span>;
  };

  const badgeOrStar = (val, weekend) => {
    if (weekend) return <span style={{ fontSize: 16 }}>⭐</span>;
    return badge(val);
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
        <div className="section-title">Pasti e macro — clicca una riga per il dettaglio</div>
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
              {righeVisibili.map((r, i) => {
                const weekend = isWeekend(r.data);
                return (
                  <tr
                    key={i}
                    onClick={() => setRigaDettaglio(r)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="td-main" style={{ whiteSpace: 'nowrap' }}>
                      {giornoSettimana(r.data)} {formatData(r.data)}
                    </td>
                    <td>{badgeOrStar(r.colazione_fatta, weekend)}</td>
                    <td>{badgeOrStar(r.post_all_fatto, weekend)}</td>
                    <td>{badgeOrStar(r.spuntino_fatto, weekend)}</td>
                    <td>{badgeOrStar(r.cena_fatta, weekend)}</td>
                    <td>
                      {r.extra
                        ? <span className="badge badge--si">✓</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td className="td-main">{num(r.totale_kcal) ?? '—'}</td>
                    <td>{num(r.totale_p) ?? '—'}</td>
                    <td>{num(r.totale_c) ?? '—'}</td>
                    <td>{num(r.totale_g) ?? '—'}</td>
                    <td>{renderEnergia(r.energia)}</td>
                  </tr>
                );
              })}
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

      {/* Modal dettaglio giornata */}
      {rigaDettaglio && (
        <div
          onClick={() => setRigaDettaglio(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 580, width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div className="fw-bold" style={{ fontSize: 18 }}>
                  {giornoSettimana(rigaDettaglio.data)} {formatData(rigaDettaglio.data)}
                </div>
                {isWeekend(rigaDettaglio.data) && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>⭐ Giorno libero</span>}
              </div>
              <button className="btn btn--ghost btn--sm" onClick={() => setRigaDettaglio(null)}>✕ Chiudi</button>
            </div>

            {/* Pasti */}
            <div className="section-title">Pasti</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['Colazione', rigaDettaglio.colazione_fatta],
                ['Post-allenamento', rigaDettaglio.post_all_fatto],
                ['Spuntino', rigaDettaglio.spuntino_fatto],
                ['Cena', rigaDettaglio.cena_fatta],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
                  <span className="text-secondary" style={{ fontSize: 13 }}>{label}</span>
                  {badge(val)}
                </div>
              ))}
            </div>

            {/* Macro */}
            <div className="section-title">Macro</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['Kcal totali', rigaDettaglio.totale_kcal, 'kcal'],
                ['Proteine', rigaDettaglio.totale_p, 'g'],
                ['Carboidrati', rigaDettaglio.totale_c, 'g'],
                ['Grassi', rigaDettaglio.totale_g, 'g'],
              ].map(([label, val, unit]) => {
                const v = val && parseFloat(val) > 0 ? parseFloat(val) : null;
                return (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
                    <span className="text-secondary" style={{ fontSize: 13 }}>{label}</span>
                    <span className="fw-bold" style={{ fontSize: 13 }}>{v != null ? `${v} ${unit}` : '—'}</span>
                  </div>
                );
              })}
            </div>

            {/* Energia */}
            {rigaDettaglio.energia !== undefined && rigaDettaglio.energia !== '' && (
              <>
                <div className="section-title">Energia</div>
                <div style={{ marginBottom: 20, fontSize: 18, color: 'var(--accent-yellow)' }}>
                  {renderEnergia(rigaDettaglio.energia)}
                </div>
              </>
            )}

            {/* Extra / Note */}
            {rigaDettaglio.extra && (
              <>
                <div className="section-title">Extra / Note</div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px',
                  fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6,
                }}>
                  {rigaDettaglio.extra}
                </div>
              </>
            )}

            {/* Bilancia */}
            {rigaDettaglio.peso_kg && parseFloat(rigaDettaglio.peso_kg) > 0 && (
              <>
                <div className="section-title">Dati bilancia</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    ['Peso', rigaDettaglio.peso_kg, 'kg'],
                    ['BMI', rigaDettaglio.bmi, ''],
                    ['BMR', rigaDettaglio.bmr, 'kcal'],
                    ['Grasso %', rigaDettaglio.grasso_pct, '%'],
                    ['Massa grassa', rigaDettaglio.massa_grassa_kg, 'kg'],
                    ['Muscolo %', rigaDettaglio.muscolo_pct, '%'],
                    ['Massa muscolare', rigaDettaglio.massa_muscolare_kg, 'kg'],
                    ['Acqua %', rigaDettaglio.acqua_pct, '%'],
                    ['Massa proteica', rigaDettaglio.massa_proteica_kg, 'kg'],
                    ['Grasso viscerale', rigaDettaglio.grasso_viscerale, ''],
                    ['Vita/Fianchi', rigaDettaglio.rapporto_vita_fianchi, ''],
                  ].map(([label, val, unit]) => {
                    const v = val && parseFloat(val) > 0 ? parseFloat(val) : null;
                    if (v == null) return null;
                    return (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }}>
                        <span className="text-secondary" style={{ fontSize: 13 }}>{label}</span>
                        <span className="fw-bold" style={{ fontSize: 13 }}>{v}{unit ? ` ${unit}` : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
