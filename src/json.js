
module.exports = toJSON;

function toJSON (capnpObject, struct) {
  let which = capnpObject.which ? capnpObject.which() : -1;
  let unionCapsName = null;
  let unionName = null;

  let data = {};

  Object.keys(capnpObject.constructor.prototype).forEach(function (method) {
    if (!method.startsWith('get')) {
      return;
    }
    var name = method.substr(3);
    var capsName = '';
    var wasLower = false;

    for (let i = 0, len = name.length; i < len; ++i) {
      if (name[i].toLowerCase() !== name[i]) {
        if (wasLower) {
          capsName += '_'
        }
        wasLower = false;
      } else {
        wasLower = true;
      }
      capsName += name[i].toUpperCase();
    }

    if (which === struct[capsName]) {
      assignGetter(data, name, capnpObject, method);
      unionName = name;
      unionCapsName = capsName;

    } else if (struct[capsName] === undefined) {
      assignGetter(data, name, capnpObject, method);
    }
  });

  return data;
}

function assignGetter(data, name, capnpObject, method) {
  Object.defineProperty(data, name, {
    enumerable: true,
    configurable: true,
    get: function () {
      var value = capnpObject[method]();
      if (value._capnp) {
        value = toJSON(value, value.constructor);
      }
      Object.defineProperty(data, name, {
        configurable: false,
        writable: false,
        value: value
      });
      return value;
    }
  });
}