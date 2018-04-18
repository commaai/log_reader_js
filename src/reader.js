const CapnpStream = require('capnp-split');
const EventWrapper = require('./event');
const Event = require('geval/event');

module.exports = streamReader;

function streamReader (inputStream) {
  var event = Event();
  var capnpStream = new CapnpStream();
  capnpStream.on('message', function (buf) {
    event.broadcast((new EventWrapper(buf)).toJSON());
  });
  inputStream.pipe(capnpStream);

  return event.listen;
}
