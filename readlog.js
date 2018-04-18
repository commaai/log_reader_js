const fs = require('fs');
const Reader = require('./src/reader');

var fileStream = fs.createReadStream('./rlog');

var reader = Reader(fileStream);
reader(function (jsonData) {
  // console.log('Some event!', jsonData);
});
