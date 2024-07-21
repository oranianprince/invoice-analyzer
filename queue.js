const Bull = require('bull');
const { analyzePdf } = require('./analyze'); // Adjust the path as necessary

const redisUrl = process.env.REDIS_URL || 'your-default-redis-url';

const pdfQueue = new Bull('pdfQueue', redisUrl);

pdfQueue.process(async (job) => {
  const { filePath1, filePath2 } = job.data;

  // Perform analysis (replace with your actual analysis logic)
  const analysis1 = await analyzePdf(filePath1);
  const analysis2 = await analyzePdf(filePath2);

  return { analysis1, analysis2 };
});

module.exports = pdfQueue;
