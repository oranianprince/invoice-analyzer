const fs = require('fs').promises;

const analyze = async (filePath) => {
  try {
    console.log(`Analyzing file: ${filePath}`);
    // Here you would implement your actual PDF analysis logic
    // For now, we'll just return a placeholder result
    const result = `Analysis result for ${filePath}`;
    
    // Clean up the file after processing
    await fs.unlink(filePath);
    
    // Ensure the result is a string
    const stringResult = JSON.stringify({ result });
    console.log(`Analysis result (stringified):`, stringResult);
    return stringResult;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    // Return error message as a string
    const errorResult = JSON.stringify({ error: error.message });
    console.log(`Analysis error (stringified):`, errorResult);
    return errorResult;
  }
};

module.exports = analyze;