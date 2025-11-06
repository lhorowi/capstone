const fs = require('fs');
const https = require('https');
const path = require('path');

console.log('Downloading PDF.js library...');

// Download PDF.js
const pdfjsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        // Check if we already have the files
        if (!fs.existsSync('pdf.min.js')) {
            console.log('Downloading pdf.min.js...');
            await downloadFile(pdfjsUrl, 'pdf.min.js');
        }
        if (!fs.existsSync('pdf.worker.min.js')) {
            console.log('Downloading pdf.worker.min.js...');
            await downloadFile(workerUrl, 'pdf.worker.min.js');
        }
        
        console.log('Using Puppeteer to test extraction in browser environment...');
        console.log('Please open http://localhost:8080/test-extract.html in your browser to test.');
        console.log('Then click "Extract Text" button and then "Download as .txt" to see the results.');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();

