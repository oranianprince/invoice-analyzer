const Queue = require('bull');
const analyze = require('./analyze');

const pdfQueue = new Queue('pdfQueue', process.env.REDIS_URL);

pdfQueue.process(async (job) => {
  const { filePath1, filePath2 } = job.data;
  return await analyze(filePath1, filePath2);
});

module.exports = pdfQueue;
