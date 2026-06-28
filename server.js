const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SHEET_ID = '1UMBAu-pjebifQEEjpvXlLzlgTleEUUNGfcm_FquCNHg';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuAvoUssscWOrloauaSvau85YN4AIGytdqn-aGktGds7PpDrZfHZD15u07UxxubAiDow/exec';
const SHEET_NAME = 'Linette se 56e verjaarsdag';

app.get('/api/entries', async (req, res) => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const r = await fetch(url);
    const csv = await r.text();
    const lines = csv.trim().split('\n');
    if (lines.length <= 1) return res.json([]);
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const entries = lines.slice(1).map(line => {
      const values = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQ = !inQ; }
        else if (line[i] === ',' && !inQ) { values.push(cur); cur = ''; }
        else { cur += line[i]; }
      }
      values.push(cur);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (values[i] || '').trim(); });
      return obj;
    });
    res.json(entries);
  } catch(e) {
    console.error('GET error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    const entry = req.body;
    const params = new URLSearchParams({
      action: 'set',
      data: JSON.stringify(entry)
    });
    const url = SCRIPT_URL + '?' + params.toString();
    const r = await fetch(url, { redirect: 'follow' });
    const text = await r.text();
    console.log('Apps Script response:', text.substring(0, 300));
    let result;
    try { result = JSON.parse(text); }
    catch(e) { result = { status: 'ok' }; }
    res.json(result);
  } catch(e) {
    console.error('POST error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
