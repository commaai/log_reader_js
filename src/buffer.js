
module.exports = {
  readMessage: readMessage,
  readSize: readSize
};

function readSize (buf, offset) {
  offset = offset || 0;
  if (offset + 8 >= buf.byteLength) {
    return null;
  }
  var localIndex = 0;

  var segments = buf.readUInt32LE(offset) + 1;
  localIndex = 0;
  var sizeArr = [];
  for (let i = 0; i < segments; ++i) {
    localIndex += 4;
    let segSize = buf.readUInt32LE(offset + localIndex);
    sizeArr.push(segSize * 8);
  }

  var size = sizeArr.reduce(function (memo, val) {
    return memo + val;
  }, localIndex);

  // round size to the word boundary, that reduce statement already took into account header size
  size += 8 - (size % 8);

  return size;
}

function readMessage (buf, offset) {
  offset = offset || 0;
  var size = readSize(buf, offset);

  return buf.slice(offset, offset + size);
}
