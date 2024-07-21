const OpenAI = require('openai');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function analyzeInvoice(pdfPath) {
  try {
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfContent = (await pdfParse(pdfBuffer)).text;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in analyzing invoices and identifying the specific services mentioned in them. Based on the content of the invoice, you will act as an expert in that field (e.g., pest control, HVAC, etc.).'
        },
        {
          role: 'user',
          content: `Please analyze this invoice and extract only the information related to the specific services provided to the client or job mentioned in the invoice. Format the analysis in proper HTML tables with headers in bold and normal font size, and the content in smaller and not bold font. Include the following sections:
            1. **Identification of Services**: List all services mentioned in the invoice specific to the client/job.
            2. **Detailed Description**: Provide a detailed description of each service listed, focusing on what exactly will be done.
            3. **Cost Breakdown**: Specify the cost for each service provided.
            4. **Exclude Irrelevant Information**: Exclude any general or unrelated information that is not specific to the services provided to this client/job.
            5. **Layman's Terms Explanation**: Explain each service in layman's terms to ensure clarity.
            6. **Cost Comparison**: Compare the quoted prices with the average prices for similar services in the region, highlighting any significant differences.
            Focus solely on the services provided for this particular client/job as detailed in the invoice:\n\n${pdfContent}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    const analysisResult = response.choices[0].message.content.trim();
    return analysisResult;
  } catch (error) {
    console.error('Error in analyzeInvoice:', error);
    throw error;
  }
}

module.exports = {
  analyzeInvoice,
};
