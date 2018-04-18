# @commaai/log_reader
Read in Comma AI `rlog` files using JavaScript. Supports, and encourages, streaming of the data.

Under the hood this is using [capnp-ts](https://npm.im/capnp-ts), [capnp-split](https://npm.im/capnp-split), and [capnp-json](https://npm.im/capnp-json) to do most of the heavy lifting.

## Installation
`npm i --save @commaai/log_reader`  
or  
`yarn add @commaai/log_reader`

## Usage
```js
const Reader = require('@commaai/log_reader');
const fs = require('fs');


var readStream = fs.createReadStream('/path/to/rlog');
var reader = Reader(readStream);

reader(function (obj) {
  console.log('This is an Event message object', obj);
});

```

# API

#### `Reader(inputStream)` => `Event(function (message)) => unlisten`
Creates a new stream reader which buffers and splits all messages coming in to it and sends all completed parsed messages over the returned `Event` interface.

The `Event` object returned is a function. This function takes in a function which will be called each time a new message is available with exactly 1 parameter, the JSONified message. This function returns an `unlisten` function which can be used to stop calling the handler. Note that unlistening to the stream of messages does not stop the stream from flowing, you will miss messages. To pause the stream you need to pause the stream feeding in the data.

#### `Reader.Event(buf)` => `EventWrapper`
`Reader.Event` is a class designed to wrap the raw buffers of individual messages. It returns a very simple wrapper.

 * `buf`: (*required* `Buffer`) The buffer containing the full unpacked message you're trying to read.

#### `EventWrapper.toJSON`
Returns a normal JavaScript object where all data available in the event is exposed as `defineProperty` values which call the underlying struct's getter method and caches the result. Read more [here](https://npm.im/capnp-json).

#### `EventWrapper.toStruct`
Return the raw [capnp-ts](https://npm.im/capnp-ts) struct. This is not recommended as using the raw struct in incorrect ways can result in *massive* performance drops. Since the JSON objects fetch all their data lazily, changes made to the underlying struct will be reflected in JSON objects who have not yet tried to look up the value.

# License
MIT @ comma.ai

Read more about how to get started hacking your car with [panda](https://shop.comma.ai/products/panda-obd-ii-dongle) [here](https://medium.com/@comma_ai/a-panda-and-a-cabana-how-to-get-started-car-hacking-with-comma-ai-b5e46fae8646).
