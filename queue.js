const Queue = require('bull');
const analyzePdf = require('./analyze');

const pdfQueue = new Queue('pdf queue', process.env.REDIS_URL);

pdfQueue.process(async (job, done) => {
  try {
    const { filePath, filePath1, filePath2 } = job.data;
    if (filePath) {
      const analysisString = await analyzePdf(filePath);
      const analysis = JSON.parse(analysisString);
      done(null, { analysis });
    } else if (filePath1 && filePath2) {
      const analysis1String = await analyzePdf(filePath1);
      const analysis2String = await analyzePdf(filePath2);
      const analysis1 = JSON.parse(analysis1String);
      const analysis2 = JSON.parse(analysis2String);
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