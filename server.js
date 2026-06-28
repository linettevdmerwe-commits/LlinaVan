const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SHEET_ID = '1UMBAu-pjebifQEEjpvXlLzlgTleEUUNGfcm_FquCNHg';
const SHEET_NAME = 'Linette se 56e verjaarsdag';
const HEADERS = ['naam','land','jaar','vlag','kosItem','drankItem','herinnering','liedjie1','artis1','skakel1','liedjie2','artis2','skakel2'];

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

app.get('/api/entries', async (req, res) => {
  try {
    const sheets = await getSheets();
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });
    const rows = r.data.values || [];
    if (rows.length <= 1) return res.json([]);
    const headers = rows[0];
    const entries = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || '');
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
    const sheets = await getSheets();
    const entry = req.body;
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });
    const rows = existing.data.values || [];
    if (rows.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: SHEET_NAME,
        valueInputOption: 'RAW',
        resource: { values: [HEADERS] },
      });
    }
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'RAW',
      resource: { values: [HEADERS.map(h => entry[h] || '')] },
    });
    res.json({ status: 'ok' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
