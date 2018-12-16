'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walk = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _richNode = require('./rich-node');

var _richNode2 = _interopRequireDefault(_richNode);

var _emberObjectMock = require('./ember-object-mock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

if (!Node) {
  var Node = { ATTRIBUTE_NODE: 2,
    CDATA_SECTION_NODE: 4,
    COMMENT_NODE: 8,
    DOCUMENT_FRAGMENT_NODE: 11,
    DOCUMENT_NODE: 9,
    DOCUMENT_POSITION_CONTAINED_BY: 16,
    DOCUMENT_POSITION_CONTAINS: 8,
    DOCUMENT_POSITION_DISCONNECTED: 1,
    DOCUMENT_POSITION_FOLLOWING: 4,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
    DOCUMENT_POSITION_PRECEDING: 2,
    DOCUMENT_TYPE_NODE: 10,
    ELEMENT_NODE: 1,
    ENTITY_NODE: 6,
    ENTITY_REFERENCE_NODE: 5,
    NOTATION_NODE: 12,
    PROCESSING_INSTRUCTION_NODE: 7,
    TEXT_NODE: 3 };
}

/**
 * DOM tree walker producing RichNodes
 *
 * @module editor-core
 * @class NodeWalker
 * @constructor
 */

var NodeWalker = function () {
  function NodeWalker() {
    _classCallCheck(this, NodeWalker);
  }

  _createClass(NodeWalker, [{
    key: 'processDomNode',

    /**
     * Processes a single dom node.
     */
    value: function processDomNode(domNode, parentNode) {
      var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var myStart = parentNode && (0, _emberObjectMock.get)(parentNode, 'end') || start;
      var richNode = this.createRichNode({
        domNode: domNode,
        parent: parentNode,
        start: myStart,
        end: myStart,
        type: this.detectDomNodeType(domNode)
      });

      // For tags, recursively analyse the children
      if ((0, _emberObjectMock.get)(richNode, 'type') === 'tag') {
        return this.processTagNode(richNode);
      }
      // For text nodes, add the content and update the index
      else if ((0, _emberObjectMock.get)(richNode, 'type') === 'text') {
          return this.processTextNode(richNode);
        }
        // For comment nodes, set update the index
        else {
            // if (get(richNode, 'type') == 'other')
            return this.processOtherNode(richNode);
          }
    }

    /**
     * Called when stepping into a child Dom node
     */

  }, {
    key: 'stepInDomNode',
    value: function stepInDomNode(richNode, childDomNode) {
      return this.processDomNode(childDomNode, richNode);
    }

    /**
     * Steps from one (or no) child node to the next.
     */

  }, {
    key: 'stepNextDomNode',
    value: function stepNextDomNode(richNode, nextDomChildren) {
      // what if we have no children?  this is broken
      var _nextDomChildren = _toArray(nextDomChildren),
          firstChild = _nextDomChildren[0],
          nextChildren = _nextDomChildren.slice(1);

      var richChildNode = this.stepInDomNode(richNode, firstChild);
      (0, _emberObjectMock.set)(richNode, 'end', (0, _emberObjectMock.get)(richChildNode, 'end'));
      if (nextChildren.length) return [richChildNode].concat(_toConsumableArray(this.stepNextDomNode(richNode, nextChildren)));else return [richChildNode];
    }

    /**
     * Called when finishing the processing of all the child nodes.
     */
    /*eslint no-unused-vars: ["error", { "args": "none" }]*/

  }, {
    key: 'finishChildSteps',
    value: function finishChildSteps(richNode) {
      return;
    }

    /**
     * Processes a single rich text node
     */

  }, {
    key: 'processTextNode',
    value: function processTextNode(richNode) {
      var domNode = (0, _emberObjectMock.get)(richNode, 'domNode');
      var start = (0, _emberObjectMock.get)(richNode, 'start');
      var text = domNode.textContent;
      (0, _emberObjectMock.set)(richNode, 'text', text);
      (0, _emberObjectMock.set)(richNode, 'end', start + text.length);
      return richNode;
    }
    /**
     * Processes a single rich tag
     */

  }, {
    key: 'processTagNode',
    value: function processTagNode(richNode) {
      (0, _emberObjectMock.set)(richNode, 'end', (0, _emberObjectMock.get)(richNode, 'start')); // end will be updated during run
      var domNode = (0, _emberObjectMock.get)(richNode, 'domNode');
      var childDomNodes = domNode.childNodes;
      (0, _emberObjectMock.set)(richNode, 'children', this.stepNextDomNode(richNode, childDomNodes));
      this.finishChildSteps(richNode);
      return richNode;
    }
    /**
     * Processes a single comment node
     */

  }, {
    key: 'processOtherNode',
    value: function processOtherNode(richNode) {
      var start = (0, _emberObjectMock.get)(richNode, 'start');
      (0, _emberObjectMock.set)(richNode, 'end', start);
      return richNode;
    }

    /**
     * Detects the type of a DOM node
     */

  }, {
    key: 'detectDomNodeType',
    value: function detectDomNodeType(domNode) {
      if (domNode.hasChildNodes && domNode.hasChildNodes()) {
        return 'tag';
      } else if (domNode.nodeType != Node.COMMENT_NODE) {
        return 'text';
      } else {
        return 'other';
      }
    }

    /**
     * Creates a rich node.
     *
     * You can override this method in order to add content to
     * the rich text nodes.
     */

  }, {
    key: 'createRichNode',
    value: function createRichNode(content) {
      return new _richNode2.default(content);
    }
  }]);

  return NodeWalker;
}();

function walk(node) {
  var NW = new NodeWalker();
  return NW.processDomNode(node);
}

exports.default = NodeWalker;
exports.walk = walk;
//# sourceMappingURL=node-walker.js.map