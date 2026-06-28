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
    credentials:
