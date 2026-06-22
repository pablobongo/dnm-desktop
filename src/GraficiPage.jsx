// GraficiPage.jsx — grafici andamento temporale
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { formatData, giornoSettimana } from './store';

const PERIODI = [
  { label: 'Ultimi 14 giorni', giorni: 14 },
  { label: 'Ultimi 30 giorni', giorni: 30 },
  { label: 'Ultimi 60 giorni', giorni: 60 },
  { label: 'Tutto', giorni: 9999 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a0533', border: '1px solid rgba(124,58,237,0.4)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ color: '#b8b8d0', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value} {p.unit || ''}
        </div>
      ))}
    </div>
  );
};

export default function GraficiPage({ dati }) {
  const [periodo, setPeriodo] = useState(30);

  const datiGrafico = useMemo(() => {
    const slice = periodo >= 9999 ? dati : dati.slice(-periodo);
    return slice
      .filter(r => r.peso_kg || r.grasso_pct || r.muscolo_pct || r.acqua_pct || r.totale_kcal)
      .map(r => ({
        data:        `${giornoSettimana(r.data)} ${formatData(r.data)}`,
        peso:        parseFloat(r.peso_kg) || null,
        grasso:      parseFloat(r.grasso_pct) || null,
        muscolo:     parseFloat(r.muscolo_pct) || null,
        acqua:       parseFloat(r.acqua_pct) || null,
        massa_grassa:parseFloat(r.massa_grassa_kg) || null,
        massa_muscolare: parseFloat(r.massa_muscolare_kg) || null,
        massa_proteica:  parseFloat(r.massa_proteica_kg) || null,
        grasso_viscerale: parseFloat(r.grasso_viscerale) || null,
        bmi:         parseFloat(r.bmi) || null,
        bmr:         parseFloat(r.bmr) || null,
        kcal:        parseFloat(r.totale_kcal) || null,
        proteine:    parseFloat(r.totale_p) || null,
        carboidrati: parseFloat(r.totale_c) || null,
        grassi:      parseFloat(r.totale_g) || null,
        energia:     parseFloat(r.energia) || null,
      }));
  }, [dati, periodo]);

  if (!dati.length) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📈</div>
        <div className="fw-bold" style={{ fontSize: 20 }}>Nessun dato da mostrare</div>
        <div className="text-muted mt-8">Sincronizza i dati dal Google Sheet nelle Impostazioni.</div>
      </div>
    );
  }

  const chartProps = {
    data: datiGrafico,
    margin: { top: 5, right: 10, left: 0, bottom: 5 },
  };

  const axisProps = {
    xAxis: <XAxis dataKey="data" tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} />,
    grid:  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />,
    tooltip: <Tooltip content={<CustomTooltip />} />,
  };

  return (
    <div>
      <div className="flex-between mb-24">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Grafici</h1>
        <div className="flex gap-8">
          {PERIODI.map(p => (
            <button
              key={p.giorni}
              className={`btn btn--sm ${periodo === p.giorni ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setPeriodo(p.giorni)}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* Peso */}
      <div className="card mb-24">
        <div className="section-title">Peso corporeo (kg)</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              {axisProps.grid}
              {axisProps.xAxis}
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              {axisProps.tooltip}
              <ReferenceLine y={83} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Target 83kg', fill: '#22c55e', fontSize: 11 }} />
              <Line type="monotone" dataKey="peso" name="Peso" stroke="#d946ef" strokeWidth={2.5} dot={{ fill: '#d946ef', r: 3 }} connectNulls unit=" kg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Composizione % */}
      <div className="card mb-24">
        <div className="section-title">Composizione corporea (%)</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              {axisProps.grid}
              {axisProps.xAxis}
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} />
              {axisProps.tooltip}
              <Legend wrapperStyle={{ fontSize: 12, color: '#b8b8d0' }} />
              <Line type="monotone" dataKey="grasso"  name="Grasso %"  stroke="#ef4444" strokeWidth={2} dot={false} connectNulls unit="%" />
              <Line type="monotone" dataKey="muscolo" name="Muscolo %"  stroke="#7c3aed" strokeWidth={2} dot={false} connectNulls unit="%" />
              <Line type="monotone" dataKey="acqua"   name="Acqua %"   stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls unit="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Masse in kg */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="section-title">Massa grassa / muscolare (kg)</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart {...chartProps}>
                {axisProps.grid}
                {axisProps.xAxis}
                <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} />
                {axisProps.tooltip}
                <Legend wrapperStyle={{ fontSize: 12, color: '#b8b8d0' }} />
                <Line type="monotone" dataKey="massa_grassa"    name="Massa grassa"    stroke="#ef4444" strokeWidth={2} dot={false} connectNulls unit=" kg" />
                <Line type="monotone" dataKey="massa_muscolare" name="Massa muscolare" stroke="#7c3aed" strokeWidth={2} dot={false} connectNulls unit=" kg" />
                <Line type="monotone" dataKey="massa_proteica"  name="Massa proteica"  stroke="#d946ef" strokeWidth={2} dot={false} connectNulls unit=" kg" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Grasso viscerale & BMI</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart {...chartProps}>
                {axisProps.grid}
                {axisProps.xAxis}
                <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} />
                {axisProps.tooltip}
                <Legend wrapperStyle={{ fontSize: 12, color: '#b8b8d0' }} />
                <Line type="monotone" dataKey="grasso_viscerale" name="Grasso viscerale" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} connectNulls />
                <Line type="monotone" dataKey="bmi"              name="BMI"              stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Macro giornalieri */}
      <div className="card mb-24">
        <div className="section-title">Macro giornalieri (g)</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              {axisProps.grid}
              {axisProps.xAxis}
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} />
              {axisProps.tooltip}
              <Legend wrapperStyle={{ fontSize: 12, color: '#b8b8d0' }} />
              <Line type="monotone" dataKey="proteine"    name="Proteine"    stroke="#7c3aed" strokeWidth={2} dot={false} connectNulls unit=" g" />
              <Line type="monotone" dataKey="carboidrati" name="Carboidrati" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls unit=" g" />
              <Line type="monotone" dataKey="grassi"      name="Grassi"      stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls unit=" g" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kcal e BMR */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title">Kcal totali giornaliere</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart {...chartProps}>
                {axisProps.grid}
                {axisProps.xAxis}
                <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} />
                {axisProps.tooltip}
                <Line type="monotone" dataKey="kcal" name="Kcal" stroke="#d946ef" strokeWidth={2.5} dot={{ fill: '#d946ef', r: 3 }} connectNulls unit=" kcal" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Energia soggettiva (1-5)</div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart {...chartProps}>
                {axisProps.grid}
                {axisProps.xAxis}
                <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 5]} ticks={[1,2,3,4,5]} />
                {axisProps.tooltip}
                <Line type="monotone" dataKey="energia" name="Energia" stroke="#facc15" strokeWidth={2.5} dot={{ fill: '#facc15', r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
