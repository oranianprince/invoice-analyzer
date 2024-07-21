const express = require('express');
const fileUpload = require('express-fileupload');
const pdfQueue = require('./queue');

const app = express();
const port = process.env.PORT || 4003;

app.use(fileUpload());

// Endpoint to handle PDF uploads and queue the processing job
app.post('/compare', async (req, res) => {
  if (!req.files || !req.files.file1 || !req.files.file2) {
    return res.status(400).send('No files were uploaded.');
  }

  const file1 = req.files.file1;
  const file2 = req.files.file2;

  const filePath1 = `/tmp/${file1.name}`;
  const filePath2 = `/tmp/${file2.name}`;

  // Save the files to the server
  await file1.mv(filePath1);
  await file2.mv(filePath2);

  // Add a job to the queue
  const job = await pdfQueue.add({ filePath1, filePath2 });

  // Respond immediately with the job ID
  res.send({ jobId: job.id });
});

// Endpoint to check the status of a job
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
