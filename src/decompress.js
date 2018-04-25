const ReaderStream = require('./reader');
const StreamSelector = require('stream-selector');
const fileType = require('file-type');
const lz4 = require('lz4');
const bz2 = require('unbzip2-stream');
const PassThrough = require('stream').PassThrough;

module.exports = DecompressStream;

function DecompressStream (inputStream, options) {
  options = options || {};
  var selectorStream = new StreamSelector({
    minBuffer: 6,
    selector: selector
  });

  selectorStream.on('error', (err) => { throw err });
  
  return new ReaderStream(inputStream.pipe(selectorStream), options);

  function selector (chunk) {
    var type = fileType(chunk);
    if (!type) {
      return new PassThrough();
    }
    switch (type.ext) {
      case '7z':
        return lz4.createDecoderStream();
      case 'bz2':
        return bz2();
      default:
        console.log('Unknown file format', type);
        return new PassThrough();
    }
  }
}
