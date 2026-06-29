const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      naam TEXT, land TEXT, jaar TEXT, vlag TEXT,
      "kosItem" TEXT, "drankItem" TEXT, herinnering TEXT,
      liedjie1 TEXT, artis1 TEXT, skakel1 TEXT,
      liedjie2 TEXT, artis2 TEXT, skakel2 TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Database ready');
}

app.get('/api/entries', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM entries ORDER BY created_at ASC');
    res.json(r.rows);
  } catch(e) {
    console.error('GET error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    const e = req.body;
    await pool.query(
      `INSERT INTO entries (naam, land, jaar, vlag, "kosItem", "drankItem", herinnering, liedjie1, artis1, skakel1, liedjie2, artis2, skakel2)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [e.naam, e.land, e.jaar, e.vlag, e.kosItem, e.drankItem, e.herinnering,
       e.liedjie1, e.artis1, e.skakel1, e.liedjie2, e.artis2, e.skakel2]
    );
    res.json({ status: 'ok' });
  } catch(e) {
    console.error('POST error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
init().then(() => {
  app.listen(PORT, () => console.log('Server running on port ' + PORT));
}).catch(err => {
  console.error('Init failed:', err.message);
  process.exit(1);
});
