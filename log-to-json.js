#!/usr/bin/env node

const fs = require('fs');
const Reader = require('./src/reader');
const cli = require('commander');
const JSONStream = require('JSONStream');
const package = require('./package');

cli
  .version(package.version)
  .usage('<source> [output]')
  .description('Take an rlog file and convert it to json. If no output file is specified, prints to stdout')
  .option('-a, --array', 'Output json as a massive array instead of newline deliminated json objects')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  cli.help();
}

let source = cli.args[0];
let destination = cli.args[1];
let destinationStream = process.stdout;

if (destination) {
  if (fs.existsSync(destination)) {
    fs.truncateSync(destination);
  }
  destinationStream = fs.createWriteStream(destination);
}

var fileStream = fs.createReadStream(source);
var jsonStream = null;
if (cli.array) {
  // default is '[', '\n,\n', ']'
  // massive array
  jsonStream = JSONStream.stringify();
} else {
  // false is shorthand for '', '\n', ''
  // that means no start/end symbol and newline deliminated
  jsonStream = JSONStream.stringify(false);
}

fileStream.on('end', () => jsonStream.end());
jsonStream.pipe(destinationStream);

var reader = Reader(fileStream);
var i = 0;
reader(function (jsonData) {
  jsonStream.write(jsonData);
});
