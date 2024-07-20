require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { analyzeInvoice } = require('./gpt4');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const db = new sqlite3.Database('hvac_quotes.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  }
});

db.run(`CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_cost REAL,
  equipment_models TEXT,
  labor_costs REAL
)`);

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    console.log('Received file:', req.file);
    const pdfPath = req.file.path;
    console.log('Analyzing invoice...');
    const analysisResult = await analyzeInvoice(pdfPath);
    console.log('Invoice analyzed:', analysisResult);

    db.run(`INSERT INTO quotes (total_cost, equipment_models, labor_costs)
            VALUES (?, ?, ?)`,
      [0, 'N/A', 0],
      function (err) {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).json({ error: 'An error occurred' });
        } else {
          console.log('Data inserted successfully with ID:', this.lastID);
          res.json({ id: this.lastID, analysis: analysisResult });
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/compare', upload.fields([{ name: 'pdfFile1', maxCount: 1 }, { name: 'pdfFile2', maxCount: 1 }]), async (req, res) => {
  try {
    console.log('Received files:', req.files);
    const pdfPath1 = req.files['pdfFile1'][0].path;
    const pdfPath2 = req.files['pdfFile2'][0].path;
    console.log('Analyzing invoices...');
    const analysisResult1 = await analyzeInvoice(pdfPath1);
    const analysisResult2 = await analyzeInvoice(pdfPath2);
    console.log('Invoices analyzed:', analysisResult1, analysisResult2);

    res.json({ analysis1: analysisResult1, analysis2: analysisResult2 });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
