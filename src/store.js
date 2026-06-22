// store.js — desktop: config, cache dati da Google Sheet

const KEYS = {
  CONFIG: 'dnm_desktop_config',
  DATI:   'dnm_desktop_dati',
  ULTIMO_SYNC: 'dnm_desktop_ultimo_sync',
};

export function getConfig() {
  try { return JSON.parse(localStorage.getItem(KEYS.CONFIG)) || {}; }
  catch { return {}; }
}

export function saveConfig(c) {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(c));
}

export function getDati() {
  try { return JSON.parse(localStorage.getItem(KEYS.DATI)) || []; }
  catch { return []; }
}

export function saveDati(rows) {
  localStorage.setItem(KEYS.DATI, JSON.stringify(rows));
  localStorage.setItem(KEYS.ULTIMO_SYNC, new Date().toISOString());
}

export function getUltimoSync() {
  return localStorage.getItem(KEYS.ULTIMO_SYNC) || null;
}

// Scarica tutti i dati dal Google Sheet
export async function sincronizzaDati(scriptUrl) {
  const res = await fetch(`${scriptUrl}?since=2025-01-01`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Errore risposta Sheet');
  // Ordina per data crescente
  const rows = (json.rows || []).sort((a, b) => a.data > b.data ? 1 : -1);
  saveDati(rows);
  return rows;
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

// Formatta data YYYY-MM-DD in DD/MM/YYYY
export function formatData(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// Giorno settimana da data
export function giornoSettimana(str) {
  if (!str) return '';
  const days = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
  return days[new Date(str + 'T12:00:00').getDay()];
}
