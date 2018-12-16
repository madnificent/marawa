'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _emberObjectMock = require('./ember-object-mock');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents an enriched DOM node.
 *
 * The DOM node is available in the 'domNode' property.
 *
 * @module editor-core
 * @class RichNode
 * @constructor
 */
var RichNode = function () {
  function RichNode(content) {
    _classCallCheck(this, RichNode);

    for (var key in content) {
      this[key] = content[key];
    }
  }

  _createClass(RichNode, [{
    key: 'region',
    value: function region() {
      var start = (0, _emberObjectMock.get)(this, 'start');
      var end = (0, _emberObjectMock.get)(this, 'end');

      return [start, end || start];
    }
  }, {
    key: 'length',
    value: function length() {
      var end = (0, _emberObjectMock.get)(this, 'end') || 0;
      var start = (0, _emberObjectMock.get)(this, 'start') || 0;
      var diff = Math.max(0, end - start);
      return diff;
    }
  }, {
    key: 'isInRegion',
    value: function isInRegion(start, end) {
      return (0, _emberObjectMock.get)(this, 'start') >= start && (0, _emberObjectMock.get)(this, 'end') <= end;
    }
  }, {
    key: 'isPartiallyInRegion',
    value: function isPartiallyInRegion(start, end) {
      return (0, _emberObjectMock.get)(this, 'start') >= start && (0, _emberObjectMock.get)(this, 'start') < end || (0, _emberObjectMock.get)(this, 'end') > start && (0, _emberObjectMock.get)(this, 'end') <= end;
    }
  }]);

  return RichNode;
}();

exports.default = RichNode;
//# sourceMappingURL=rich-node.js.map