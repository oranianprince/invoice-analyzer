const { analyzeInvoice } = require('./gpt4');
const fs = require('fs').promises;

const analyze = async (filePath) => {
  try {
    console.log(`Analyzing file: ${filePath}`);
    const result = await analyzeInvoice(filePath);
    await fs.unlink(filePath); // Clean up the file after processing
    console.log(`Analysis result:`, result);
    
    // Remove the triple backticks from the result if present
    const cleanedResult = result.replace(/```html\s*|```/g, '').trim();

    return cleanedResult;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    return `Error: ${error.message}`;
  }
};

module.exports = analyze;
