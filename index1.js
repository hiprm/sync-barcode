const express = require('express');
const axios = require('axios');
const chokidar = require('chokidar');
const fs = require('fs').promises;

const app = express();
const port = 3001;

// Get the current date in YYYYMMDD format
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based
const day = String(today.getDate()).padStart(2, '0');
const dateFormatted = `${year}${month}${day}`;

console.log(dateFormatted);

const csvFilePath1 = 'D:/training/PROLOGICS/U'+dateFormatted+'.csv';
const csvFilePath2 = 'D:/training/PROLOGICS/'+dateFormatted+'.csv';
// const apiUrl1 = 'http://173.230.135.7/api/barcode-registry/uniformity-files';
// const apiUrl2 = 'http://173.230.135.7/api/barcode-registry/in-balancing-file';
 const apiUrl1 = 'http://localhost:3000/api/barcode-registry/uniformity-files'; // Replace with your first API endpoint
 const apiUrl2 = 'http://localhost:3000/api/barcode-registry/in-balancing-file'; // Replace with your second API endpoint

let previousData1 = null;
let previousData2 = null;

function startFileWatcher(filePath, apiUrl, previousData) {
  const watcher = chokidar.watch(filePath);
  watcher.on('change', async (path) => {
    console.log('File changed:', path);
    await checkFileAndUpdate(filePath, apiUrl, previousData);
  });
}

async function checkFileAndUpdate(filePath, apiUrl, previousData) {
  try {
    const csvData = await fs.readFile(filePath, 'utf8');
    
    const lines = csvData.split('\n');
    const latestLine = lines[lines.length - 2]; // Get the latest non-empty line
    
    if (latestLine) {
      // Split the line based on commas
      const columns = latestLine.split(',');

      // Process the special case of semicolons in the first column (A)
      const firstColumnValue = columns[0].split(';');
      columns[0] = firstColumnValue.join(',');

      const jsonDataObj = {};
      
      columns.forEach((column, index) => {
        // Convert the index to an alphabet-based column ID
        const columnName = convertToColumnName(index);
        jsonDataObj[columnName] = column.trim(); // Trim to remove extra whitespace
      });

      console.log('Latest Record (JSON):', jsonDataObj);
      
      await callApi(apiUrl, jsonDataObj);
    } else {
      console.log('No new data found in the file.');
    }
  } catch (error) {
    console.error('Error reading the CSV file:', error.message);
  }
}

function convertToColumnName(index) {
  let columnName = '';
  while (index >= 0) {
    columnName = String.fromCharCode(65 + (index % 26)) + columnName;
    index = Math.floor(index / 26) - 1;
  }
  return columnName;
}

async function callApi(apiUrl, updatedData) {
  try {
    console.log(updatedData);
    await axios.post(apiUrl, {
      updatedData,
      machine_no: "1"
    });
    console.log('API call successful.');
  } catch (error) {
    console.error('API call failed:', error);
  }
}

app.get('/', (req, res) => {
  res.send('CSV file monitoring and API triggering is active.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startFileWatcher(csvFilePath1, apiUrl1, previousData1);
  startFileWatcher(csvFilePath2, apiUrl2, previousData2);
});