const OpenAI = require('openai');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function analyzeInvoice(pdfPath) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfContent = (await pdfParse(pdfBuffer)).text;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are an expert in pest control services and invoices.' },
        { role: 'user', content: `Analyze this quote and identify the services that are being quoted to me, what price they're being quoted to me at, and explain to me in laymen terms what each thing they'll be doing means. Next, I want you to compare the price points with average price points for those services in the region:\n\n${pdfContent}` }
      ],
      max_tokens: 1000,
      temperature: 0.5,
    });

    const analysisResult = response.choices[0].message.content.trim();

    return {
      analysis: analysisResult,
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = {
  analyzeInvoice,
};
