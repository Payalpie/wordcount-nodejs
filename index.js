const fs = require('fs');
const path = require('path');
const async = require('async');

const directoryPath = path.join(__dirname);

// Function to read file content and count word frequencies
const readFileContent = (filePath, callback) => {
  try {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) return callback(err);
      const wordCount = {};
      const words = content.replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word) wordCount[word] = (wordCount[word] || 0) + 1;
      });
      callback(null, wordCount);
    });
  } catch (err) {
    console.log('Error reading file ', err);
    callback(err);
  }
}

// Process all files and combine word counts
const processFiles = (callback) => {
  try {
    fs.readdir(directoryPath, (err, files) => {
      if (err) return callback(err);
      const txtFiles = files.filter(file => file.endsWith('.txt'));
      const filePaths = txtFiles.map(file => path.join(directoryPath, file));
      async.map(filePaths, readFileContent, (err, results) => {
        if (err) return callback(err);
        const combinedCounts = {};
        results.forEach(result => {
          Object.keys(result).forEach(word => {
            combinedCounts[word] = (combinedCounts[word] || 0) + result[word];
          });
        });
        callback(null, combinedCounts);
      });
    });
  } catch (err) {
    console.log('Error processing file ', err);
    callback(err);
  }
}

// Calculate font sizes and prepare output
const assignFontSizesAndOutput = (wordCounts) => {
  try {
    const maxFrequency = Math.max(...Object.values(wordCounts));
    const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);
    const output = sortedWords.filter(word => wordCounts[word] > 1).map(word => {
      const frequency = wordCounts[word];
      let fontSize = 'Small';
      if (frequency === maxFrequency) {
        fontSize = 'Huge';
      } else if (frequency >= 0.6 * maxFrequency) {
        fontSize = 'Big';
      } else if (frequency >= 0.3 * maxFrequency) {
        fontSize = 'Normal';
      }
      return `${word}: ${frequency} (${fontSize})`;
    }).join('\n');

    fs.writeFile('output.txt', output, err => {
      if (err) console.error('Failed to write output:', err);
      else console.log('Word cloud generated successfully!');
    });
  } catch (err) {
    console.log('Error assigning font size and output ', err);
    callback(err);
  }
}

// Main function to run the program
const main = () => {
  try {
    processFiles((err, combinedCounts) => {
      if (err) {
        console.error('Error processing files:', err);
      } else {
        assignFontSizesAndOutput(combinedCounts);
      }
    });
  } catch (err) {
    console.log('Error in main function ', err);
  }
}

main();
