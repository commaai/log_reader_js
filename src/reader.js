const CapnpStream = require('capnp-split');
const EventWrapper = require('./event');
const Event = require('geval/event');

module.exports = streamReader;

function streamReader (inputStream, options) {
  options = options || {};
  const event = Event();
  const capnpStream = new CapnpStream();
  const isBinary = !!options.binary;

  var isStarted = false;

  capnpStream.on('message', function (buf) {
    if (!isBinary) {
      event.broadcast((new EventWrapper(buf)).toJSON());
    } else {
      event.broadcast(buf);
    }
  });

  return pipeAndListen;

  function pipeAndListen (fn) {
    if (!isStarted) {
      isStarted = true;
      inputStream.pipe(capnpStream);
    }

    return event.listen(fn);
  }
}
