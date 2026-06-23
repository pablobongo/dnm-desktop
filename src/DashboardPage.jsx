// DashboardPage.jsx — KPI e riepilogo
import { useMemo } from 'react';
import { ultimoValore, media, formatData, giornoSettimana, getConfig, APP_VERSION } from './store';

export default function DashboardPage({ dati }) {
  const ultimi7 = useMemo(() => dati.slice(-7), [dati]);
  const ultimi30 = useMemo(() => dati.slice(-30), [dati]);

  const config = getConfig();
  const pesoAttuale  = ultimoValore(dati, 'peso_kg');
  const pesoInizio   = parseFloat(config.pesoInizio) || 88;
  const pesoTarget   = parseFloat(config.pesoTarget) || 83;
  const pesoPerso    = pesoAttuale ? (pesoInizio - pesoAttuale).toFixed(1) : null;
  const progressoPct = pesoAttuale ? Math.min(100, Math.round(((pesoInizio - pesoAttuale) / (pesoInizio - pesoTarget)) * 100)) : 0;

  const grassoAttuale  = ultimoValore(dati, 'grasso_pct');
  const muscoloAttuale = ultimoValore(dati, 'muscolo_pct');
  const acquaAttuale   = ultimoValore(dati, 'acqua_pct');
  const bmrAttuale     = ultimoValore(dati, 'bmr');

  const mediaKcal7  = media(ultimi7, 'totale_kcal');
  const mediaP7     = media(ultimi7, 'totale_p');
  const mediaC7     = media(ultimi7, 'totale_c');
  const mediaG7     = media(ultimi7, 'totale_g');

  const ultimaData  = dati.length ? formatData(dati[dati.length - 1].data) : null;

  if (!dati.length) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
        <div className="fw-bold" style={{ fontSize: 20, marginBottom: 8 }}>Nessun dato ancora</div>
        <div className="text-muted">Vai in Impostazioni e sincronizza i dati dal Google Sheet.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-24">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
          <span className="text-muted text-xs">v{APP_VERSION}</span>
        </div>
        {ultimaData && <span className="text-muted text-sm">Ultimo dato: {ultimaData}</span>}
      </div>

      {/* Obiettivo peso */}
      <div className="card card--gradient mb-24">
        <div className="flex-between mb-16">
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Obiettivo peso</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Da {pesoInizio} kg → {pesoTarget} kg (−{pesoInizio - pesoTarget} kg)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-magenta)' }}>
              {pesoAttuale ? `${pesoAttuale} kg` : '—'}
            </div>
            {pesoPerso && (
              <div className={`text-sm ${parseFloat(pesoPerso) > 0 ? 'text-success' : 'text-danger'}`}>
                {parseFloat(pesoPerso) > 0 ? `−${pesoPerso} kg persi` : `+${Math.abs(pesoPerso)} kg`}
              </div>
            )}
          </div>
        </div>
        {/* Barra progresso */}
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 100,
            background: 'var(--gradient-btn)',
            width: `${progressoPct}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div className="text-muted text-sm mt-8">{progressoPct}% completato</div>
      </div>

      {/* KPI composizione corporea */}
      <div className="section-title">Composizione corporea attuale</div>
      <div className="kpi-grid mb-24">
        {[
          { label: 'Grasso corporeo', value: grassoAttuale, unit: '%', color: 'var(--accent-magenta)' },
          { label: 'Massa muscolare', value: muscoloAttuale, unit: '%', color: 'var(--accent-violet)' },
          { label: 'Acqua corporea',  value: acquaAttuale,  unit: '%', color: 'var(--accent-blue)' },
          { label: 'Metabolismo basale', value: bmrAttuale, unit: 'kcal', color: 'var(--accent-yellow)' },
        ].map(({ label, value, unit, color }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-card__label">{label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="kpi-card__value" style={{ color }}>{value ?? '—'}</span>
              {value && <span className="kpi-card__unit">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Macro medi ultimi 7 giorni */}
      <div className="section-title">Media macro — ultimi 7 giorni</div>
      <div className="kpi-grid mb-24">
        {[
          { label: 'Kcal medie', value: mediaKcal7, unit: 'kcal', color: 'var(--accent-magenta)' },
          { label: 'Proteine medie', value: mediaP7, unit: 'g', color: 'var(--accent-violet)' },
          { label: 'Carboidrati medi', value: mediaC7, unit: 'g', color: 'var(--accent-blue)' },
          { label: 'Grassi medi', value: mediaG7, unit: 'g', color: 'var(--accent-yellow)' },
        ].map(({ label, value, unit, color }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-card__label">{label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="kpi-card__value" style={{ color }}>{value ?? '—'}</span>
              {value && <span className="kpi-card__unit">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Ultimi 7 giorni — riepilogo pasti */}
      <div className="section-title">Ultimi 7 giorni</div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colazione</th>
                <th>Post-all.</th>
                <th>Spuntino</th>
                <th>Cena</th>
                <th>Kcal tot.</th>
                <th>Energia</th>
              </tr>
            </thead>
            <tbody>
              {ultimi7.slice().reverse().map((r, i) => (
                <tr key={i}>
                  <td className="td-main">{giornoSettimana(r.data)} {formatData(r.data)}</td>
                  <td><span className={`badge badge--${r.colazione_fatta}`}>{r.colazione_fatta === 'si' ? '✓' : '✗'}</span></td>
                  <td><span className={`badge badge--${r.post_all_fatto}`}>{r.post_all_fatto === 'si' ? '✓' : '✗'}</span></td>
                  <td><span className={`badge badge--${r.spuntino_fatto}`}>{r.spuntino_fatto === 'si' ? '✓' : '✗'}</span></td>
                  <td><span className={`badge badge--${r.cena_fatta}`}>{r.cena_fatta === 'si' ? '✓' : '✗'}</span></td>
                  <td className="td-main">{r.totale_kcal || '—'}</td>
                  <td>{r.energia ? `${'★'.repeat(parseInt(r.energia))}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
