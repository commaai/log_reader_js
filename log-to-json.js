#!/usr/bin/env node

const fs = require('fs');
const Reader = require('./');
const EventWrapper = require('./src/event');
const cli = require('commander');
const JSONStream = require('JSONStream');
const package = require('./package');

cli
  .version(package.version)
  .usage('[source]')
  .description('Take an rlog file and convert it to json. If no output file is specified, prints to stdout')
  .option('-a, --array', 'Output json as a massive array instead of newline deliminated json objects')
  .option('-o, --output <filename>', 'Output file to write the JSON values to')
  .option('-m, --message <index>', 'Print a specific message')
  .option('-b, --binary', 'Print the raw binary as opposed to the pretty JSON')
  .parse(process.argv);

let source = cli.args[0];
let sourceStream = process.stdin;
let destination = cli.output;
let destinationStream = process.stdout;

if (cli.message) {
  cli.message = Number(cli.message);
}

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

jsonStream.pipe(destinationStream);

var reader = Reader(sourceStream, {
  binary: !!cli.binary
});
var i = 0;
reader(function (jsonData) {
  ++i;
  if (!cli.message) {
    jsonStream.write(jsonData);
  } else if (cli.message === i) {
    jsonStream.write(jsonData);
    jsonStream.end(null);
    process.exit(0);
  }
});
