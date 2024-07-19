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
    console.log('Received file:', req.file); // Debug log for received file
    const pdfPath = req.file.path;
    console.log('Analyzing invoice...'); // Debug log before analysis
    const analysisResult = await analyzeInvoice(pdfPath);
    console.log('Invoice analyzed:', analysisResult); // Debug log for analysis result

    // Insert a placeholder for database insertion. You can customize it as needed.
    db.run(`INSERT INTO quotes (total_cost, equipment_models, labor_costs)
            VALUES (?, ?, ?)`,
      [0, 'N/A', 0],
      function (err) {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).json({ error: 'An error occurred' });
        } else {
          console.log('Data inserted successfully with ID:', this.lastID); // Debug log for successful insert
          res.json({ id: this.lastID, ...analysisResult });
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
