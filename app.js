const fs = require('fs');
const csvParser = require('csv-parser');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.static('public'));
app.use(express.json());


function parseHHMMSS(timeString) {
  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = parseInt(timeParts[2], 10);
  return { hours, minutes, seconds };
}

// Function to calculate time difference in hours and minutes
function calculateTimeDifference(startTime, endTime) {
  const start = parseHHMMSS(startTime);
  const end = parseHHMMSS(endTime);

  let startInSeconds = start.hours * 3600 + start.minutes * 60 + start.seconds;
  let endInSeconds = end.hours * 3600 + end.minutes * 60 + end.seconds;

  // If the end time is earlier than the start time, assume it's the next day
  if (endInSeconds < startInSeconds) {
    endInSeconds += 24 * 3600; // Add 24 hours to the end time in seconds
  }

  const differenceInSeconds = endInSeconds - startInSeconds;
  const hours = Math.floor(differenceInSeconds / 3600);
  const minutes = Math.floor((differenceInSeconds % 3600) / 60);

  return { hours, minutes };
}


// POST route to handle '/check' requests
app.post('/check', (req, res) => {
  const { textData, date } = req.body;
  console.log('Received:', textData, date);
  
  let y = textData.toString();
  let b = y.split("-"); // Assuming textData format has "-" separator
  console.log("test b- " + b[0]);

  const results = [];

  // Read and parse the CSV file
  fs.createReadStream('./public/Employees/User1/datauser.csv')
    .pipe(csvParser())
    .on('data', (data) => {
      // Push each row (data) into the results array
      results.push(data);
    })
    .on('end', () => {
      // After reading and parsing, get the last entry
      if (results.length > 0) {
        const lastEntry = results[results.length - 1]; // Get the last entry
        console.log('Last Entry:', lastEntry); // Display the last entry

        
        let lastValue = lastEntry['info']; // Adjust to match your actual CSV column name
        console.log("last value= " +lastValue);
        let x=lastValue.toString();
        let a=x.split("-");
        console.log("last value for a[0]= " +a[0]);
        let result = b[0].localeCompare(a[0]);

        console.log("Comparison result: ", result);

        if (result != 0) {

          let i=a[1].split(" ");
          let j=b[1].split(" ");
          console.log("i= "+i[0]);
          console.log("j= "+j[0]);

          const { hours, minutes } = calculateTimeDifference(i[0], j[0]);
          console.log(`Worked for ${hours} hours and ${minutes} minutes`);

          // Append the received data to the CSV file
          fs.appendFile('./public/Employees/User1/datauser.csv', `${textData}\n`, (err) => {
            if (err) {
              console.error('Error writing to file:', err);
              return res.status(500).json({ message: 'Server Error' });
            }

            // Send a success response back to the client
            res.status(200).json({ message: 'Data received and stored successfully' });
          });

          fs.writeFile("./public/Employees/User1/workinghrs.txt",`Working Hours on ${date} are- ${hours} hours and ${minutes} minutes` ,function(err){
            if (err) throw err;
            console.log("successful");
            
          })
    

        } else {
          console.log("Data is a duplicate. Not writing to CSV.");
          res.status(200).json({ message: 'Duplicate entry, not stored.' });
        }
      } else {
        console.log('No entries found in the CSV file.');

        // If no entries, append the new data
        fs.appendFile('./public/Employees/User1/datauser.csv', `${textData}\n`, (err) => {
          if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({ message: 'Server Error' });
          }

          // Send a success response back to the client
          res.status(200).json({ message: 'Data received and stored successfully' });
        });
      }
    })
    .on('error', (error) => {
      console.error('Error reading the CSV file:', error);
      return res.status(500).json({ message: 'Server Error' });
    });
});

// Start the server
app.listen(port, () => console.log(`Blog app listening on port ${port}!`));
