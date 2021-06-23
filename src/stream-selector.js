const through2 = require('through2');

module.exports = StreamSelector;

function StreamSelector (options) {
  if (!(this instanceof StreamSelector)) {
    return new StreamSelector(options);
  }

  var curBuffer = null;
  var destinationStream = null;
  var isDeciding = false;
  options = options || {};
  if (typeof options === 'function') {
    options = {
      selector: options
    };
  }

  return through2(transform, flush);

  function flush (cb) {
    if (destinationStream.flush) {
      destinationStream.flush(cb);
    } else {
      destinationStream.end();
      cb();
    }
  }

  function transform (chunk, encoding, done) {
    if (destinationStream) {
      destinationStream.write(chunk, encoding, done);
      return;
    }
    // haven't found a good destination stream yet, keep trying...
    // store data we're buffering so we can make sure to send it all when we find a stream
    // also, some streams might not be ready on the first packet, they might need 2 to classify
    if (!curBuffer) {
      curBuffer = chunk;
    } else {
      curBuffer = Buffer.concat([curBuffer, chunk]);
    }
    if (options.minBuffer && options.minBuffer > curBuffer.byteLength) {
      // wait for more data before deciding...
      return done();
    }
    if (isDeciding) {
      // keep buffering and waiting for the decision to come back.
      return done();
    }
    if (curBuffer.byteLength < 1) {
      // don't make them decide if we don't even have data yet...
      return done();
    }
    isDeciding = true;
    let stream = options.selector(curBuffer, encoding, (err, stream) => {
      if (err) {
        return this.emit('error', err);
      }
      if (destinationStream) {
        return this.emit('error', new Error('Cannot specific destination stream twice. You cannot use the callback and also return a value'));
      }
      if (!stream) {
        return this.emit('error', new Error('Selector method did not return an error or a destination stream'));
      }
      assignStream(stream, encoding, this);
      done();
    });

    if (stream) {
      assignStream(stream, encoding, this);
      done();
    }
  }

  function assignStream (stream, encoding, self) {
    if (destinationStream === stream) {
      return;
    }
    destinationStream = stream;

    if (curBuffer) {
      destinationStream.on('data', self.push.bind(self));
      destinationStream.write(curBuffer, encoding);
      curBuffer = null;
    }
  }
}
