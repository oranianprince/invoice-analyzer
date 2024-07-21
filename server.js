const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const pdfQueue = require('./queue');
const app = express();
const port = process.env.PORT || 3000;

app.use(fileUpload());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.pdfFile) {
      return res.status(400).send('No file was uploaded.');
    }
    const pdfFile = req.files.pdfFile;
    const filePath = `/tmp/${pdfFile.name}`;
    await pdfFile.mv(filePath);
    const job = await pdfQueue.add({ filePath });
    res.send({ jobId: job.id });
  } catch (error) {
    console.error('Error in /upload:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.post('/compare', async (req, res) => {
  try {
    if (!req.files || !req.files.pdfFile1 || !req.files.pdfFile2) {
      return res.status(400).send('No files were uploaded.');
    }
    const pdfFile1 = req.files.pdfFile1;
    const pdfFile2 = req.files.pdfFile2;
    const filePath1 = `/tmp/${pdfFile1.name}`;
    const filePath2 = `/tmp/${pdfFile2.name}`;
    await pdfFile1.mv(filePath1);
    await pdfFile2.mv(filePath2);
    const job = await pdfQueue.add({ filePath1, filePath2 });
    res.send({ jobId: job.id });
  } catch (error) {
    console.error('Error in /compare:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.get('/status/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await pdfQueue.getJob(jobId);
    if (!job) {
      return res.status(404).send('Job not found');
    }
    const state = await job.getState();
    const result = job.returnvalue;
    res.send({ status: state, result });
  } catch (error) {
    console.error('Error in /status:', error);
    res.status(500).send('An error occurred while checking job status.');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});