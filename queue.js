const Queue = require('bull');
const analyze = require('./analyze');

// Create a new queue for processing PDF analysis jobs
const pdfQueue = new Queue('pdfQueue', process.env.REDIS_URL);

// Define the processing function for the queue
pdfQueue.process(async (job) => {
  const { filePath1, filePath2 } = job.data;
  try {
    const analysisResult = await analyze(filePath1, filePath2);
    return analysisResult;
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
});

// Export the queue for use in other parts of the application
module.exports = pdfQueue;
