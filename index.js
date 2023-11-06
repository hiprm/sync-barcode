const express = require('express');
const axios = require('axios');
const chokidar = require('chokidar');
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Get the current date in YYYYMMDD format
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based
const day = String(today.getDate()).padStart(2, '0');
//const dateFormatted = `${year}${month}${day}`;

const dateFormatted= '20231025';

console.log(dateFormatted);

const csvFilePath1 = 'D:/training/PROLOGICS/U'+dateFormatted+'.csv'; // Replace with the path to your first CSV file
const csvFilePath2 = 'D:/training/PROLOGICS/'+dateFormatted+'.csv'; // Replace with the path to your second CSV file
const apiUrl1 = 'http://173.230.135.7/api/barcode-registry/uniformity-files'; // Replace with your first API endpoint
const apiUrl2 = '{base_url}/api/trigger-record2'; // Replace with your second API endpoint

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
      const columns = latestLine.split(',');
      const jsonDataObj = {};
      
      columns.forEach((column, index) => {
        // Convert the index to an alphabet-based column ID
        const columnName = convertToColumnName(index);
        jsonDataObj[columnName] = column;
      });
      
      console.log('Latest Record (JSON):', jsonDataObj);
      
      // Call the corresponding API with the JSON data of the latest record
      await callApi(apiUrl, jsonDataObj);
    } else {
      console.log('No new data found in the file.');
    }
  } catch (error) {
    console.error('Error reading the CSV file:', error.message);
  }
}

// Function to convert an index to an alphabet-based column ID
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
    await axios.post(apiUrl, {
      updatedData,
      // You can include additional request data here based on your API requirements.
    });
    console.log('API call successful.');
  } catch (error) {
    console.error('API call failed:', error.message);
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