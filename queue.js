const Bull = require('bull');
const path = require('path');
const { analyzePdf } = require('./analyze'); // Assuming you have a separate analyze module for PDF analysis

const pdfQueue = new Bull('pdfQueue', {
  redis: { port: 6379, host: '127.0.0.1' } // Use appropriate Redis connection settings
});

pdfQueue.process(async (job) => {
  const { filePath1, filePath2 } = job.data;

  // Perform analysis (replace with your actual analysis logic)
  const analysis1 = await analyzePdf(filePath1);
  const analysis2 = await analyzePdf(filePath2);

  return { analysis1, analysis2 };
});

module.exports = pdfQueue;
