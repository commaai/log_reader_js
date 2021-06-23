var stream = require('stream');
var util = require('util');
var buffUtil = require('./buffer');

module.exports = CapnpStream;

util.inherits(CapnpStream, stream.Writable);

function CapnpStream () {
  stream.Writable.call(this);
  this.curBuffer = null;
}

CapnpStream.prototype.readNextMessage = function () {
  if (this.curBuffer.byteLength < 8) {
    return false;
  }
  var size = buffUtil.readSize(this.curBuffer);
  if (!size || size > this.curBuffer.byteLength) {
    return false;
  }
  this.emit('message', this.curBuffer.slice(0, size));
  this.curBuffer = this.curBuffer.slice(size);

  return true;
};

CapnpStream.prototype._write = function (chunk, encoding, done) {
  if (!this.curBuffer) {
    this.curBuffer = chunk;
  } else if (chunk.byteLength || chunk.length) {
    this.curBuffer = Buffer.concat([this.curBuffer, chunk]);
  }
  while (this.readNextMessage());

  done();
};
