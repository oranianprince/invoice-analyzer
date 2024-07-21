const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const pdfQueue = require('./queue'); // Import the queue

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let uploadedFile = req.files.pdfFile;
  let uploadPath = path.join(__dirname, 'uploads', uploadedFile.name);

  try {
    await uploadedFile.mv(uploadPath);
    res.send('File uploaded!');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/compare', async (req, res) => {
  if (!req.files || Object.keys(req.files).length < 2) {
    return res.status(400).send('Two files are required for comparison.');
  }

  let uploadedFile1 = req.files.pdfFile1;
  let uploadedFile2 = req.files.pdfFile2;
  let uploadPath1 = path.join(__dirname, 'uploads', uploadedFile1.name);
  let uploadPath2 = path.join(__dirname, 'uploads', uploadedFile2.name);

  try {
    await uploadedFile1.mv(uploadPath1);
    await uploadedFile2.mv(uploadPath2);

    const job = await pdfQueue.add({ filePath1: uploadPath1, filePath2: uploadPath2 });

    job.on('completed', (result) => {
      res.json(result.returnvalue);
    });

    job.on('failed', (err) => {
      res.status(500).send(err.message);
    });

  } catch (err) {
    res.status(500).send(err);
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.setTimeout(2 * 60 * 1000); // Set server timeout to 2 minutes
