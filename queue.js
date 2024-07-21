const Queue = require('bull');
const analyzePdf = require('./analyze');

const pdfQueue = new Queue('pdf queue', process.env.REDIS_URL);

pdfQueue.process(async (job, done) => {
  try {
    const { filePath, filePath1, filePath2 } = job.data;
    if (filePath) {
      const analysis = await analyzePdf(filePath);
      done(null, { analysis });
    } else if (filePath1 && filePath2) {
      const analysis1 = await analyzePdf(filePath1);
      const analysis2 = await analyzePdf(filePath2);
      done(null, { analysis1, analysis2 });
    } else {
      throw new Error('Invalid job data');
    }
  } catch (error) {
    console.error('Error processing job:', error);
    done(error);
  }
});

pdfQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

module.exports = pdfQueue;