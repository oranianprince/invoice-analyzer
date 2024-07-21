const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Queue = require('bull');
const Redis = require('ioredis');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 4003;
const upload = multer({ dest: 'uploads/' });

// Configure Redis
const redisClient = new Redis(process.env.REDIS_URL);

// Create a queue for processing PDF comparisons
const compareQueue = new Queue('compare', process.env.REDIS_URL);

// Middleware to increase server timeout (for internal processing)
server.timeout = 120000; // 2 minutes

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to upload and analyze a single PDF
app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // Simulate analysis
  setTimeout(() => {
    res.json({ analysis: 'This is a simulated analysis of the uploaded PDF.' });
  }, 5000); // 5 seconds delay to simulate analysis
});

// Endpoint to upload and compare two PDFs
app.post('/compare', upload.fields([{ name: 'pdfFile1' }, { name: 'pdfFile2' }]), async (req, res) => {
  if (!req.files || !req.files['pdfFile1'] || !req.files['pdfFile2']) {
    return res.status(400).send('Two files must be uploaded.');
  }
  // Add a job to the queue
  const job = await compareQueue.add({
    pdfFile1: req.files['pdfFile1'][0].path,
    pdfFile2: req.files['pdfFile2'][0].path,
  });

  // Respond with job ID
  res.json({ jobId: job.id });
});

// Endpoint to check job status
app.get('/job/:id', async (req, res) => {
  const job = await compareQueue.getJob(req.params.id);
  if (job === null) {
    return res.status(404).send('Job not found.');
  }
  const state = await job.getState();
  const progress = job.progress();
  const result = job.returnvalue;
  res.json({ state, progress, result });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Process the job queue
compareQueue.process(async (job, done) => {
  try {
    // Simulate comparison
    setTimeout(() => {
      done(null, {
        analysis1: 'This is a simulated analysis of the first PDF.',
        analysis2: 'This is a simulated analysis of the second PDF.',
      });
    }, 10000); // 10 seconds delay to simulate comparison
  } catch (error) {
    done(error);
  }
});
