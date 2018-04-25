const CapnpStream = require('capnp-split');
const EventWrapper = require('./event');
const Event = require('geval/event');

module.exports = streamReader;

function streamReader (inputStream, options) {
  const event = Event();
  const capnpStream = new CapnpStream();
  const isBinary = !!options.binary;

  capnpStream.on('message', function (buf) {
    if (!isBinary) {
      event.broadcast((new EventWrapper(buf)).toJSON());
    } else {
      event.broadcast(buf);
    }
  });
  inputStream.pipe(capnpStream);

  return event.listen;
}
