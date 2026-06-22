// ImpostazioniPage.jsx — desktop
import { useState, useEffect } from 'react';
import { getConfig, saveConfig, getUltimoSync, sincronizzaDati } from './store';

export default function ImpostazioniPage({ showToast, onSincronizzato }) {
  const [config, setConfig] = useState({});
  const [ultimoSync, setUltimoSync] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
    setUltimoSync(getUltimoSync());
  }, []);

  const handleSalva = () => {
    saveConfig(config);
    showToast('Impostazioni salvate ✓', 'success');
  };

  const handleSync = async () => {
    if (!config.scriptUrl) { showToast('Inserisci prima l\'URL Google Sheet', 'error'); return; }
    setLoading(true);
    try {
      const rows = await sincronizzaDati(config.scriptUrl);
      setUltimoSync(new Date().toISOString());
      onSincronizzato(rows);
      showToast(`Sincronizzati ${rows.length} giorni ✓`, 'success');
    } catch (err) {
      showToast('Errore sincronizzazione: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const formatSync = (iso) => {
    if (!iso) return 'Mai';
    return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 className="page-title">Impostazioni</h1>

      <div className="section-title">Connessione Google Sheet</div>
      <div className="card mb-24">
        <div>
          <label className="label">URL Google Apps Script</label>
          <input
            type="url"
            className="input"
            placeholder="https://script.google.com/macros/s/..."
            value={config.scriptUrl || ''}
            onChange={e => setConfig(c => ({ ...c, scriptUrl: e.target.value }))}
          />
          <div className="text-muted text-sm mt-8">
            Stesso URL usato nella PWA mobile.
          </div>
        </div>
        <button className="btn btn--primary mt-16" onClick={handleSalva}>
          Salva impostazioni
        </button>
      </div>

      <div className="section-title">Sincronizzazione dati</div>
      <div className="card mb-24">
        <div className="flex-between mb-16">
          <div>
            <div className="fw-bold" style={{ fontSize: 15 }}>Importa dati dal Google Sheet</div>
            <div className="text-muted text-sm mt-8">
              Ultima sincronizzazione: <strong>{formatSync(ultimoSync)}</strong>
            </div>
          </div>
          <button className="btn btn--primary" onClick={handleSync} disabled={loading}>
            {loading ? <><span className="spinner" />&nbsp;Sincronizzazione...</> : '🔄 Sincronizza ora'}
          </button>
        </div>
        <div className="text-muted text-sm">
          Scarica tutti i dati dal Google Sheet e aggiorna la dashboard, i grafici e lo storico.
          Esegui questa operazione ogni volta che vuoi vedere i dati più recenti inseriti dalla PWA mobile.
        </div>
      </div>

      <div className="section-title">Obiettivo peso</div>
      <div className="card">
        <div className="grid-2" style={{ gap: 16 }}>
          <div>
            <label className="label">Peso iniziale (kg)</label>
            <input type="number" step="0.1" className="input" placeholder="88" value={config.pesoInizio || ''} onChange={e => setConfig(c => ({ ...c, pesoInizio: e.target.value }))} />
          </div>
          <div>
            <label className="label">Peso target (kg)</label>
            <input type="number" step="0.1" className="input" placeholder="83" value={config.pesoTarget || ''} onChange={e => setConfig(c => ({ ...c, pesoTarget: e.target.value }))} />
          </div>
        </div>
        <button className="btn btn--secondary mt-16" onClick={handleSalva}>Salva obiettivo</button>
      </div>
    </div>
  );
}
