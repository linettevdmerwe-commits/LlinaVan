const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SHEET_ID = '1UMBAu-pjebifQEEjpvXlLzlgTleEUUNGfcm_FquCNHg';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzh6hdqOQBaoJdIi60-RxZsQrKFFNQyipDGTLuiT8JHCD5y4ygw8IkTMYZ4x6-LR7ChsQ/exec';

app.get('/api/entries', async (req, res) => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Linette%20se%2056e%20verjaarsdag`;
    const r = await fetch(url);
    const csv = await r.text();
    const lines = csv.trim().split('\n');
    if (lines.length <= 1) return res.json([]);
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const entries = lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (values[i] || '').replace(/^"|"$/g, '').trim();
      });
      return obj;
    });
    res.json(entries);
  } catch(e) {
    console.error(e);
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
    const r = await fetch(APPS_SCRIPT_URL + '?' + params.toString());
    const result = await r.json();
    res.json(result);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
