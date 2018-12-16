"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function get(object, key) {
  return object[key];
}

function set(object, key, value) {
  object[key] = value;
}

function warn(string) {
  console.log(string);
};

exports.get = get;
exports.set = set;
exports.warn = warn;
//# sourceMappingURL=ember-object-mock.js.map