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

## Command Line Tools
This package ships with a CLI tool. Check the `--help` command to see all of the options.

#### `log-to-json [source]`
The most simple and obvious use case for this library. This tool takes in the path to a `source` log file and converts the entire thing into JSON. If `source` is is not specified then `stdin` will be used. The `-o` flag can be used to write the output to a file instead of `stdout`

Examples:
```bash
# Convert an entire log file into a JSON feed
$ log-to-json rlog -o rlog.json

# Write the JSON as 1 giant array instead of newline deliminated objects
$ log-to-json rlog --array -o rlog.json
```
```bash
# read from stdin and write to stdout
$ cat rlog | log-to-json
```

# Update capnproto schema
first get the commaai capnp-ts fork set up (requires some enhancements)
```
# needs to be in home dir
cd ~/
git clone git@github.com:commaai/capnp-ts.git
cd capnp-ts
# requires node v8.x
nvm use lts/carbon
yarn install
yarn build
```
then convert the schema definiton to javascript
```
# needs to be in home dir
cd ~/
git clone git@github.com:commaai/log_reader_js.git
# requires node v14.x
nvm use lts/fermium
yarn install
# assumes path to capnpc-ts is: ../capnp-ts/packages/capnpc-js/bin/capnpc-js.js
yarn run generate-capnp-js
```

# License
MIT @ comma.ai

Read more about how to get started hacking your car with [panda](https://shop.comma.ai/products/panda-obd-ii-dongle) [here](https://medium.com/@comma_ai/a-panda-and-a-cabana-how-to-get-started-car-hacking-with-comma-ai-b5e46fae8646).
