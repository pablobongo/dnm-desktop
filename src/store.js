// store.js — desktop: config, cache dati da Google Sheet

export const APP_VERSION = '1.0.0';

const KEYS = {
  CONFIG: 'dnm_desktop_config',
  DATI:   'dnm_desktop_dati',
  ULTIMO_SYNC: 'dnm_desktop_ultimo_sync',
};

// Converte boolean/stringa Sheet → 'si'/'no'/valore originale
function normalizzaBool(val) {
  if (val === true  || val === 'true'  || val === 'TRUE'  || val === '1' || val === 1) return 'si';
  if (val === false || val === 'false' || val === 'FALSE' || val === '0' || val === 0) return 'no';
  return val;
}

// Normalizza una riga: data ISO → YYYY-MM-DD, booleani → si/no
function normalizzaRiga(r) {
  return {
    ...r,
    data: r.data && typeof r.data === 'string' && r.data.includes('T') ? r.data.split('T')[0] : r.data,
    colazione_fatta: normalizzaBool(r.colazione_fatta),
    post_all_fatto:  normalizzaBool(r.post_all_fatto),
    spuntino_fatto:  normalizzaBool(r.spuntino_fatto),
    cena_fatta:      normalizzaBool(r.cena_fatta),
  };
}

export function getConfig() {
  try { return JSON.parse(localStorage.getItem(KEYS.CONFIG)) || {}; }
  catch { return {}; }
}

export function saveConfig(c) {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(c));
}

export function getDati() {
  try {
    const rows = JSON.parse(localStorage.getItem(KEYS.DATI)) || [];
    return rows.map(normalizzaRiga);
  }
  catch { return []; }
}

export function saveDati(rows) {
  localStorage.setItem(KEYS.DATI, JSON.stringify(rows));
  localStorage.setItem(KEYS.ULTIMO_SYNC, new Date().toISOString());
}

export function getUltimoSync() {
  return localStorage.getItem(KEYS.ULTIMO_SYNC) || null;
}

// Scarica tutti i dati dal Google Sheet tramite JSONP (evita CORS)
export async function sincronizzaDati(scriptUrl) {
  return new Promise((resolve, reject) => {
    const callbackName = 'dnm_cb_' + Date.now();
    const script = document.createElement('script');

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout — nessuna risposta dallo script'));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (data) => {
      cleanup();
      if (!data.ok) { reject(new Error(data.error || 'Errore risposta Sheet')); return; }
      const rows = (data.rows || [])
        .map(normalizzaRiga)
        .sort((a, b) => a.data > b.data ? 1 : -1);
      saveDati(rows);
      resolve(rows);
    };

    const url = `${scriptUrl}?since=2025-01-01&callback=${callbackName}`;
    script.src = url;
    script.onerror = () => { cleanup(); reject(new Error('Errore caricamento script')); };
    document.head.appendChild(script);
  });
}

// Calcola media di un campo numerico su un array di righe
export function media(rows, campo) {
  const vals = rows.map(r => parseFloat(r[campo])).filter(v => !isNaN(v) && v > 0);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

// Ultimo valore non vuoto di un campo
export function ultimoValore(rows, campo) {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = parseFloat(rows[i][campo]);
    if (!isNaN(v) && v > 0) return v;
  }
  return null;
}

// Formatta data YYYY-MM-DD in DD/MM/YYYY (gestisce anche ISO per sicurezza)
export function formatData(str) {
  if (!str) return '';
  const s = typeof str === 'string' && str.includes('T') ? str.split('T')[0] : String(str);
  const parts = s.split('-');
  if (parts.length !== 3) return s;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Giorno settimana da data YYYY-MM-DD
export function giornoSettimana(str) {
  if (!str) return '';
  const s = typeof str === 'string' && str.includes('T') ? str.split('T')[0] : String(str);
  const days = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
  return days[new Date(s + 'T12:00:00').getDay()];
}
