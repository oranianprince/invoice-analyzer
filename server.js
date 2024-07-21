const express = require('express');
const fileUpload = require('express-fileupload');
const pdfQueue = require('./queue');
const path = require('path');

const app = express();
const port = process.env.PORT || 4003;

app.use(fileUpload());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/compare', async (req, res) => {
  if (!req.files || !req.files.file1 || !req.files.file2) {
    return res.status(400).send('No files were uploaded.');
  }

  const file1 = req.files.file1;
  const file2 = req.files.file2;

  const filePath1 = `/tmp/${file1.name}`;
  const filePath2 = `/tmp/${file2.name}`;

  await file1.mv(filePath1);
  await file2.mv(filePath2);

  const job = await pdfQueue.add({ filePath1, filePath2 });

  res.send({ jobId: job.id });
});

app.get('/job/:id', async (req, res) => {
  const jobId = req.params.id;
  const job = await pdfQueue.getJob(jobId);

  if (!job) {
    return res.status(404).send('Job not found');
  }

  const state = await job.getState();
  const result = job.returnvalue;

  res.send({ state, result });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
