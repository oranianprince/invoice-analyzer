const { analyzeInvoice } = require('./gpt4');
const fs = require('fs').promises;

const analyze = async (filePath) => {
  try {
    console.log(`Analyzing file: ${filePath}`);
    const result = await analyzeInvoice(filePath);
    console.log(`Raw analysis result:`, result);
    await fs.unlink(filePath); // Clean up the file after processing
    
    // Ensure result is a string
    const cleanedResult = result.replace(/```html\s*|```/g, '').trim();
    console.log(`Cleaned analysis result:`, cleanedResult);
    
    return cleanedResult;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    return `Error: ${error.message}`;
  }
};

module.exports = analyze;
