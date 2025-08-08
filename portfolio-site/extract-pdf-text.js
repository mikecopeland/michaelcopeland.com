const fs = require('fs');
const pdf = require('pdf-parse');

async function extractPdfText() {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync('./src/assets/resume/Michael Copeland.pdf');
    
    // Parse the PDF
    const data = await pdf(dataBuffer);
    
    console.log('=== PDF TEXT EXTRACTED ===');
    console.log('Total pages:', data.numpages);
    console.log('Text length:', data.text.length);
    console.log('\n=== EXTRACTED TEXT ===');
    console.log(data.text);
    
    // Save to a text file for easier reading
    fs.writeFileSync('./resume-text.txt', data.text);
    console.log('\n=== TEXT SAVED TO resume-text.txt ===');
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
  }
}

extractPdfText();

