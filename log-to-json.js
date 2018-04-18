#!/usr/bin/env node

const fs = require('fs');
const Reader = require('./src/reader');
const cli = require('commander');
const JSONStream = require('JSONStream');
const package = require('./package');

cli
  .version(package.version)
  .usage('[source]')
  .description('Take an rlog file and convert it to json. If no output file is specified, prints to stdout')
  .option('-a, --array', 'Output json as a massive array instead of newline deliminated json objects')
  .option('-o, --output <filename>', 'Output file to write the JSON values to')
  .parse(process.argv);

let source = cli.args[0];
let sourceStream = process.stdin;
let destination = cli.output;
let destinationStream = process.stdout;

if (destination) {
  if (fs.existsSync(destination)) {
    fs.truncateSync(destination);
  }
  destinationStream = fs.createWriteStream(destination);
}

if (source) {
  sourceStream = fs.createReadStream(source);
}

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

sourceStream.on('end', () => jsonStream.end());
jsonStream.pipe(destinationStream);

var reader = Reader(sourceStream);
var i = 0;
reader(function (jsonData) {
  jsonStream.write(jsonData);
});
