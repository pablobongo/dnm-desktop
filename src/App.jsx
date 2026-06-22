// App.jsx — D.N.M. Desktop
import { useState, useEffect } from 'react';
import './index.css';
import DashboardPage    from './DashboardPage';
import GraficiPage      from './GraficiPage';
import StoricoPage      from './StoricoPage';
import ImpostazioniPage from './ImpostazioniPage';
import { useToast }     from './useToast.jsx';
import { getDati } from './store';

const NAV = [
  { key: 'dashboard',    icon: '📊', label: 'Dashboard' },
  { key: 'grafici',      icon: '📈', label: 'Grafici' },
  { key: 'storico',      icon: '📋', label: 'Storico' },
  { key: 'impostazioni', icon: '⚙️',  label: 'Impostazioni' },
];

export default function App() {
  const [pagina, setPagina] = useState('dashboard');
  const [dati, setDati] = useState([]);
  const { showToast, Toast } = useToast();

  useEffect(() => { setDati(getDati()); }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-title">D.N.M.</div>
          <div className="sidebar__logo-sub">DEMOSE NA REGOLADA</div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Dashboard</div>
        </div>
        <nav className="sidebar__nav">
          {NAV.map(({ key, icon, label }) => (
            <button key={key} className={`sidebar__item ${pagina === key ? 'active' : ''}`} onClick={() => setPagina(key)}>
              <span className="sidebar__item-icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          {dati.length > 0 ? `${dati.length} giorni registrati` : 'Nessun dato — sincronizza'}
        </div>
      </aside>

      <main className="main-content">
        {pagina === 'dashboard'    && <DashboardPage dati={dati} />}
        {pagina === 'grafici'      && <GraficiPage   dati={dati} />}
        {pagina === 'storico'      && <StoricoPage   dati={dati} />}
        {pagina === 'impostazioni' && <ImpostazioniPage showToast={showToast} onSincronizzato={setDati} />}
      </main>

      {Toast}
    </div>
  );
}
