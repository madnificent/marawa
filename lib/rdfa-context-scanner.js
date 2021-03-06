'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvePrefixes = exports.analyse = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _emberObjectMock = require('./ember-object-mock');

var _rdfaConfig = require('./support/rdfa-config');

var _nodeWalker = require('./node-walker');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Resolves the URIs in an RDFa attributes object with the correct prefix
 * based on a set of known prefixes.
 *
 * @method resolvePrefix
 *
 * @param {Object} rdfaAttributes An object of RDFa attributes
 * @param {Object} prefixes A map of known prefixes
 *
 * @return {Object} An RDFa attributes object containing resolved URIs
 */
function resolvePrefixes(rdfaAttributes, prefixes) {
  var clonedAttributes = Object.assign({}, rdfaAttributes);
  _rdfaConfig.prefixableRdfaKeywords.forEach(function (key) {
    if (clonedAttributes[key] != null) clonedAttributes[key] = resolvePrefix(clonedAttributes[key], prefixes);
  });
  return clonedAttributes;
}

/**
 * Resolves a given (array of) URI(s) with the correct prefix (if it's prefixed)
 * based on a set of known prefixes.
 *
 * @method resolvePrefix
 *
 * @param {string|Array} uri An (array of) URI(s) to resolve
 * @param {Object} prefixes A map of known prefixes
 *
 * @return {string} The resolved URI
 *
 * @private
 */
function resolvePrefix(uri, prefixes) {
  var resolve = function resolve(uri) {
    if (isFullUri(uri) || isRelativeUrl(uri)) {
      return uri;
    } else {
      var i = uri.indexOf(':');

      if (i < 0) {
        // no prefix defined. Use default.
        if (prefixes[''] == null) (0, _emberObjectMock.warn)('No default RDFa prefix defined', { id: 'rdfa.missingPrefix' });
        uri = prefixes[''] + uri;
      } else {
        var key = uri.substr(0, i);
        if (prefixes[key] == null) (0, _emberObjectMock.warn)('No RDFa prefix \'' + key + '\' defined', { id: 'rdfa.missingPrefix' });
        uri = prefixes[key] + uri.substr(i + 1);
      }

      return uri;
    }
  };

  if (Array.isArray(uri)) {
    return uri.map(function (u) {
      return resolve(u);
    });
  } else {
    return resolve(uri);
  }
}

/**
 * Returns whether a given URI is a full URI.
 *
 * @method isFullUri
 *
 * @param {string} uri A URI
 *
 * @return {boolean} Whether the given URI is a full URI.
 *
 * @private
 */
function isFullUri(uri) {
  return uri.includes('://');
}

/**
 * Returns whether a given URI is a relative URI.
 *
 * @method isRelativeUrl
 *
 * @param {string} uri A URI
 *
 * @return {boolean} Whether the given URI is a relative URI.
 *
 * @private
 */
function isRelativeUrl(uri) {
  return uri.startsWith('#') || uri.startsWith('/') || uri.startsWith('./') || uri.startsWith('../');
}

/**
 * Scanner of the RDFa context of DOM nodes
 *
 * @module editor-core
 * @class RdfaContextScanner
 * @constructor
 * @extends EmberObject
 */

var RdfaContextScanner = function () {
  function RdfaContextScanner() {
    _classCallCheck(this, RdfaContextScanner);
  }

  _createClass(RdfaContextScanner, [{
    key: 'analyse',

    /**
     * Analyse the RDFa contexts of a specific region in a text
     *
     * @method analyse
     *
     * @param {Node} domNode Root DOM node containing the text
     * @param {[number,number]} region Region in the text for which RDFa contexts must be calculated
     *
     * @return {Array} Array of contexts mapping text parts from the specified region to their RDFa context
     *               A context element consists of:
     *               - region: Region in the text on which the RDFa context applies
     *               - context: RDFa context (an array of triple objects) of the region
     *               - text: Plain text of the region
     *
     * @public
     */
    value: function analyse(domNode, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          start = _ref2[0],
          end = _ref2[1];

      if (domNode == null || start < 0 || end < start) return [];

      var richNode = (0, _nodeWalker.walk)(domNode);

      this.enrichRichNodeWithRdfa(richNode);
      var rootRdfa = this.calculateRdfaToTop(richNode);
      this.expandRdfaContext(richNode, rootRdfa.context, rootRdfa.prefixes);

      return this.flattenRdfaTree(richNode, [start, end]);
    }

    /**
     * Enrich a rich node recursively with its RDFa attributes
     *
     * @method enrichRichNodeWithRdfa
     *
     * @param {RichNode} richNode Rich node to enrich with its RDFa attributes
     *
     * @private
    */

  }, {
    key: 'enrichRichNodeWithRdfa',
    value: function enrichRichNodeWithRdfa(richNode) {
      var _this = this;

      var rdfaAttributes = this.getRdfaAttributes((0, _emberObjectMock.get)(richNode, 'domNode'));
      (0, _emberObjectMock.set)(richNode, 'rdfaAttributes', rdfaAttributes);

      if ((0, _emberObjectMock.get)(richNode, 'children')) {
        (0, _emberObjectMock.get)(richNode, 'children').forEach(function (child) {
          _this.enrichRichNodeWithRdfa(child);
        });
      }
    }

    /**
     * Calculate the RDFa context from a given node to the top of the document
     *
     * @method calculateRdfaToTop
     *
     * @param {RichNode} richNode Rich node to start from
     *
     * @return {Object} Object containing the RDFa context and prefixes uptil the given node
     *
     * @private
    */

  }, {
    key: 'calculateRdfaToTop',
    value: function calculateRdfaToTop(richNode) {
      var _this2 = this;

      var rootContext = [];
      var resolvedRootContext = [];
      var rootPrefixes = _rdfaConfig.defaultPrefixes;

      var startNode = (0, _emberObjectMock.get)(richNode, 'domNode');

      if (startNode.parentNode) {
        // start 1 level above the rootNode of the NodeWalker
        for (var node = startNode.parentNode; node.parentNode; node = node.parentNode) {
          var rdfaAttributes = this.getRdfaAttributes(node);
          if (!this.isEmptyRdfaAttributes(rdfaAttributes)) {
            rootContext.push(rdfaAttributes);
          }
        }

        rootContext.reverse(); // get rdfa attributes from top to bottom

        rootContext.forEach(function (rdfa) {
          rootPrefixes = _this2.mergePrefixes(rootPrefixes, rdfa);
          var context = resolvePrefixes(rdfa, rootPrefixes);
          resolvedRootContext.push(context);
        });
      }

      return {
        context: resolvedRootContext,
        prefixes: rootPrefixes
      };
    }

    /**
     * Recursively expands the RDFa context of a rich node
     * I.e. resolve prefixes and augment RDFa context based on the prefixes and RDFa context of its parent
     *
     * @method expandRdfaContext
     *
     * @param {RichNode} richNode Rich node to expand the RDFa from
     * @param {Array} parentContext RDFa context of the node's parent
     * @param {Object} parentPrefixes RDFa prefixes defined at the node's parent level
     *
     * @private
    */

  }, {
    key: 'expandRdfaContext',
    value: function expandRdfaContext(richNode, parentContext, parentPrefixes) {
      var _this3 = this;

      var nodeRdfaAttributes = (0, _emberObjectMock.get)(richNode, 'rdfaAttributes');

      var prefixes = this.mergePrefixes(parentPrefixes, nodeRdfaAttributes);
      (0, _emberObjectMock.set)(richNode, 'rdfaPrefixes', prefixes);

      if (!this.isEmptyRdfaAttributes(nodeRdfaAttributes)) {
        var resolvedRdfaAttributes = resolvePrefixes(nodeRdfaAttributes, prefixes);
        (0, _emberObjectMock.set)(richNode, 'rdfaContext', parentContext.concat(resolvedRdfaAttributes));
      } else {
        (0, _emberObjectMock.set)(richNode, 'rdfaContext', parentContext);
      }

      if ((0, _emberObjectMock.get)(richNode, 'children')) {
        (0, _emberObjectMock.get)(richNode, 'children').forEach(function (child) {
          var context = (0, _emberObjectMock.get)(richNode, 'rdfaContext');
          var prefixes = (0, _emberObjectMock.get)(richNode, 'rdfaPrefixes');

          _this3.expandRdfaContext(child, context, prefixes);
        });
      }
    }

    /**
     * Flatten and reduce a rich node RDFa tree to an array of rich leaf nodes.
     * Only the text nodes falling in a specified region are returned.
     *
     * It is the goal to yield a flattened tree of RDFa statements.
     * Combining as many of them as possible.  Some examples on how we
     * intend to combine nodes will explain the intent better than a
     * long description.  The following cases represent a DOM tree.  The
     * o represents a tag which doesn't contain semantic content and
     * which in itself isn't rendered as a block.  The l represents a
     * logical block, these are blocks which render as a visually
     * separate block in html or which contain semantic content.  When
     * moving upward, we want to combine these nodes in order.  When
     * combining the nodes, we represent a non-mergeable logical block
     * by putting parens around it.
     *
     * For the two examples below, we explain the logic under the
     * drawing.
     *
     *
     *  1:        o      <-  (l) (oo) o (l)
     *           / \
     *  2:      l   o    <-  l = (l) (oo)  o = o l
     *         /|\  |\
     *  3:    l o o o l
     *
     *      -> l oo o l <-
     *
     * At the lowest level of nodes (3), we notice there's a logical
     * block, followed by two inline blocks.  The two inline blocks can
     * be combined.  Moving one level up (2), we see that these three
     * blocks are composed within a logical block.  Hence we can't
     * further combine the (oo) statement further up the hierarchy.
     * Moving to the right, we see an o and an l, which can't be further
     * combined.
     *
     *  -> (l) (o o) o l <-
     *
     *  1:        o      <-  (l) ooo (l)
     *           / \
     *  2:      o   o    <-  l = (l) oo   o = o (l)
     *         /|\  |\
     *  3:    l o o o l
     *
     *      -> l ooo l <-
     *
     * This case is different from the previous case.  On level 3, in
     * the left, we combine l o o to represent (l) oo.  The two
     * non-logical blocks can be combined.  As we move these to a level
     * up (2), we're still left with one logical block, and two
     * non-logical blocks.  The right of level 3 consists of o l.  These
     * too are stored in a non-logical block.  Hence we can combine them
     * to represent o (l).  Combining further at the top level (1), we
     * can combine all the three o as non of them is a logical block.
     * Because level 1 itself isn't a logical block either, we don't put
     * them between parens.  Hence, we end up with the blocks l ooo l.
     *
     * @method flattenRdfaTree
     *
     * @param {RichNode} richNode Rich node to flatten
     * @param {[number,number]} region Region in the text for which RDFa nodes must be returned
     *
     * @return {Array} Array of rich leaf text nodes falling in a specified region
     *
     * @private
     */

  }, {
    key: 'flattenRdfaTree',
    value: function flattenRdfaTree(richNode, _ref3) {
      var _this4 = this;

      var _ref4 = _slicedToArray(_ref3, 2),
          start = _ref4[0],
          end = _ref4[1];

      // TODO take [start, end] argumentns into account

      // ran before processing the current node
      var preprocessNode = function preprocessNode(richNode) {
        // does this node represent a logical block of content?
        (0, _emberObjectMock.set)(richNode, 'isLogicalBlock', _this4.nodeIsLogicalBlock(richNode));
      };

      // ran when processing a single child node
      var processChildNode = function processChildNode(node) {
        _this4.flattenRdfaTree(node, [start, end]);
      };

      // ran when we're finished processing all child nodes
      var finishChildSteps = function finishChildSteps(node) {
        (0, _emberObjectMock.set)(node, 'rdfaBlocks', _this4.getRdfaBlockList(node));
      };

      preprocessNode(richNode);
      ((0, _emberObjectMock.get)(richNode, 'children') || []).map(function (node) {
        return processChildNode(node);
      });
      finishChildSteps(richNode);

      return (0, _emberObjectMock.get)(richNode, 'rdfaBlocks');
    }

    /**
     * Get an array of (combined) RDFa nodes for the supplied richNode.
     * Takes into account the properties of the richNode, and the
     * previously calculated rdfaNodeList of the children.
     *
     * @method getRdfaNodeList
     *
     * @param {RichNode} richNode The node for which to return the rdfaNodeList.
     *
     * @return {[RdfaBlock]} Array of rdfaBlock items.
     *
     * @private
     */

  }, {
    key: 'getRdfaBlockList',
    value: function getRdfaBlockList(richNode) {
      switch ((0, _emberObjectMock.get)(richNode, 'type')) {
        case "text":
          return this.createRdfaBlocksFromText(richNode);
        case "tag":
          return this.createRdfaBlocksFromTag(richNode);
        default:
          return [];
      }
    }

    /**
     * Returns an array of rdfaBlock items for the supplied richNode,
     * assuming that is a text node.
     *
     * @method createRdfaBlocksFromText
     *
     * @param {RichNode} richNode The text node for which to return the
     * rdfa blocks.
     *
     * @return {[RdfaBlock]} Array of rdfaBlock items.
     *
     * @private
     */

  }, {
    key: 'createRdfaBlocksFromText',
    value: function createRdfaBlocksFromText(richNode) {
      return [{
        region: richNode.region(),
        text: (0, _emberObjectMock.get)(richNode, 'text'),
        context: this.toTriples((0, _emberObjectMock.get)(richNode, 'rdfaContext')),
        richNode: [richNode],
        isRdfaBlock: (0, _emberObjectMock.get)(richNode, 'isLogicalBlock'),
        semanticNode: (0, _emberObjectMock.get)(richNode, 'isLogicalBlock') && richNode
      }];
    }

    /**
     * Returns an array of rdfaBlock items for the supplied richNode,
     * assuming that is a tag node.
     *
     * The idea is to first get the rdfaBlocks from each of our children
     * and put them in a flat list.  We only need to check the first and
     * last children for combination, but we're lazy and try to combine
     * each of them.  In step three we clone this list, so we don't
     * overwrite what was previously used (handy for debugging).  Then
     * we possible overwrite the isRdfaBlock property, based on the
     * property of our own richNode.  If we are an rdfaBlock, none of
     * our children is still allowed to be combined after we ran the
     * combinator.
     *
     * @method createRdfaBlocksFromTag
     *
     * @param {RichNode} richNode RichNode for which the rdfaBlock items
     * will be returned.
     *
     * @return {[RdfaBlock]} Array of rdfaBlock items for this tag.
     *
     * @private
     */

  }, {
    key: 'createRdfaBlocksFromTag',
    value: function createRdfaBlocksFromTag(richNode) {
      // flatten our children
      var flatRdfaChildren = ((0, _emberObjectMock.get)(richNode, 'children') || []).map(function (child) {
        return (0, _emberObjectMock.get)(child, 'rdfaBlocks');
      }).reduce(function (a, b) {
        return a.concat(b);
      }, []);

      // map & combine children when possible
      var combinedChildren = this.combineRdfaBlocks(flatRdfaChildren);

      // clone children
      // const clonedChildren = combinedChildren.map( this.shallowClone );

      // override isRdfaBlock on each child, based on current node
      // set ourselves as the current first richNode in the blocks's rich nodes
      if ((0, _emberObjectMock.get)(richNode, 'isLogicalBlock')) combinedChildren.forEach(function (child) {
        (0, _emberObjectMock.set)(child, 'isRdfaBlock', true);
        if (!(0, _emberObjectMock.get)(child, 'semanticNode')) (0, _emberObjectMock.set)(child, 'semanticNode', richNode);
      });

      // return new map
      return combinedChildren;
    }

    /**
     * Combines an array of rdfa blocks based on their properties.
     *
     * @method combineRdfaBlocks
     *
     * @param {[RichNode]} nodes Set of rich nodes for which we'll
     * combine the rdfaBlocks.
     *
     * @return {[RdfaBlock]} Array of rdfaBlocks after the combineable
     * ones were combined.
     *
     * @private
     */

  }, {
    key: 'combineRdfaBlocks',
    value: function combineRdfaBlocks(nodes) {
      if (nodes.length <= 1) {
        return nodes;
      } else {
        // walk front-to back, build result in reverse order
        var firstElement = void 0,
            restElements = void 0;

        var _nodes = _toArray(nodes);

        firstElement = _nodes[0];
        restElements = _nodes.slice(1);

        var combinedElements = restElements.reduce(function (_ref5, newElement) {
          var _ref6 = _toArray(_ref5),
              pastElement = _ref6[0],
              rest = _ref6.slice(1);

          if ((0, _emberObjectMock.get)(pastElement, 'isRdfaBlock') || (0, _emberObjectMock.get)(newElement, 'isRdfaBlock')) return [newElement, pastElement].concat(_toConsumableArray(rest));else {
            var _get = (0, _emberObjectMock.get)(pastElement, 'region'),
                _get2 = _slicedToArray(_get, 2),
                start = _get2[0],
                end = _get2[1];

            var combinedRichNodes = [pastElement, newElement].map(function (e) {
              return (0, _emberObjectMock.get)(e, 'richNode');
            }).reduce(function (a, b) {
              return a.concat(b);
            }, []);

            var combinedRdfaNode = {
              region: [start, end],
              text: (0, _emberObjectMock.get)(pastElement, 'text').concat((0, _emberObjectMock.get)(newElement, 'text')),
              context: (0, _emberObjectMock.get)(pastElement, 'context'), // pick any of the two
              richNode: combinedRichNodes,
              isRdfaBlock: false // these two nodes are text nodes
            };
            return [combinedRdfaNode].concat(_toConsumableArray(rest));
          }
        }, [firstElement]);
        // reverse generated array
        combinedElements.reverse();
        return combinedElements;
      }
    }

    /**
     * Returns a shallow clone of the supplied object
     *
     * @param {Object} rdfaBlock The object to clone
     *
     * @return {Object} A shallow clone of the supplied object.
     *
     * @private
     */

  }, {
    key: 'shallowClone',
    value: function shallowClone(rdfaBlock) {
      return Object.assign({}, rdfaBlock);
    }

    /**
     * Returns truethy if the supplied node represents a logical block.
     * We expect to override this as we discover new cases.  In general
     * we check whether there's RDFa defined on the element and/or
     * whether it is a block when rendered in the browser with the
     * current style.
     *
     * @method nodeIsLogicalBlock
     *
     * @param {RichNode} richNode Rich node which will be checked
     *
     * @return {boolean} True iff the node is a logical block
     *
     * @private
     */

  }, {
    key: 'nodeIsLogicalBlock',
    value: function nodeIsLogicalBlock(richNode) {
      // non-tags are never blocks
      if ((0, _emberObjectMock.get)(richNode, 'type') != "tag") {
        return false;
      } else {
        if (!this.isEmptyRdfaAttributes((0, _emberObjectMock.get)(richNode, 'rdfaAttributes')) || this.isDisplayedAsBlock(richNode)) return true;else return false;
      }
    }

    /**
     * Get the RDFa attributes of a DOM node
     *
     * @method getRdfaAttributes
     *
     * @param {Node} domNode DOM node to get the RDFa attributes from
     *
     * @return {Object} Map of RDFa attributes key-value pairs
     *
     * @private
     */

  }, {
    key: 'getRdfaAttributes',
    value: function getRdfaAttributes(domNode) {
      var rdfaAttributes = {};

      if (domNode && domNode.getAttribute) {
        _rdfaConfig.rdfaKeywords.forEach(function (key) {
          rdfaAttributes[key] = domNode.getAttribute(key);
        });

        if (rdfaAttributes['typeof'] != null) rdfaAttributes['typeof'] = rdfaAttributes['typeof'].split(' ');
      }

      rdfaAttributes['text'] = domNode.textContent;

      return rdfaAttributes;
    }

    /**
     * Returns whether a given RDFa attributes object is empty. This means no RDFa statement is set.
     *
     * @method isEmptyRdfaAttributes
     *
     * @param {Object} rdfaAttributes An RDFa attributes object
     *
     * @return {boolean} Whether the given RDFa attributes object is empty.
     *
     * @private
     */

  }, {
    key: 'isEmptyRdfaAttributes',
    value: function isEmptyRdfaAttributes(rdfaAttributes) {
      return _rdfaConfig.rdfaKeywords.map(function (key) {
        return rdfaAttributes[key] == null;
      }).reduce(function (a, b) {
        return a && b;
      });
    }

    /**
     * Create a map of RDFa prefixes by merging an existing map of RDFa prefixes with new RDFa attributes
     *
     * @method mergePrefixes
     *
     * @param {Object} prefixes An map of RDFa prefixes
     * @param {Object} rdfAttributes An RDFa attributes object
     *
     * @return {Object} An new map of RDFa prefixes
     *
     * @private
     */

  }, {
    key: 'mergePrefixes',
    value: function mergePrefixes(prefixes, rdfaAttributes) {
      var mergedPrefixes = Object.assign({}, prefixes);

      if (rdfaAttributes['vocab'] != null) {
        mergedPrefixes[''] = rdfaAttributes['vocab'];
      }
      if (rdfaAttributes['prefix'] != null) {
        var parts = rdfaAttributes['prefix'].split(" ");
        for (var i = 0; i < parts.length; i = i + 2) {
          var key = parts[i].substr(0, parts[i].length - 1);
          mergedPrefixes[key] = parts[i + 1];
        }
      }

      return mergedPrefixes;
    }

    /**
     * Transforms an array of RDFa attribute objects to an array of triples.
     * A triple is an object consisting of a subject, predicate and object.
     *
     * @method toTriples
     *
     * @param {Array} contexts An array of RDFa attribute objects
     *
     * @returns {Array} An array of triple objects
     *
     * @private
     */

  }, {
    key: 'toTriples',
    value: function toTriples(rdfaAttributes) {
      var triples = [];

      var currentScope = null;

      rdfaAttributes.forEach(function (rdfa) {
        var nextScope = null;

        var triple = {};

        if (rdfa['about'] != null) currentScope = rdfa['about'];

        if (rdfa['content'] != null) triple.object = rdfa['content'];
        if (rdfa['datatype'] != null) triple.datatype = rdfa['datatype'];

        if (rdfa['property'] != null) {
          triple.predicate = rdfa['property'];

          if (rdfa['href'] != null) triple.object = rdfa['href'];

          if (rdfa['resource'] != null) {
            triple.object = rdfa['resource'];
            nextScope = rdfa['resource'];
          }

          if (triple.object == null) triple.object = rdfa.text;
        } else {
          if (rdfa['resource'] != null) currentScope = rdfa['resource'];
        }

        triple.subject = currentScope;
        if (triple.predicate != null) {
          triples.push(triple);
        }

        if (rdfa['typeof'] != null) {
          rdfa['typeof'].forEach(function (type) {
            triples.push({
              subject: rdfa['resource'], // create a blank node if resource == null
              predicate: 'a',
              object: type
            });
          });
        }

        // TODO: add support for 'rel' keyword: https://www.w3.org/TR/rdfa-primer/#alternative-for-setting-the-property-rel
        // TODO: add support for 'src' keyword

        // nextScope becomes the subject at the next level
        if (nextScope != null) {
          currentScope = nextScope;
        }
      });

      return triples;
    }

    /**
     * Whether an element is displayed as a block
     *
     * @method isDisplayedAsBlock
     *
     * @param {RichNode} richNode Node to validate
     *
     * @return {boolean} true iff the element is displayed as a block
     *
     * @private
     */

  }, {
    key: 'isDisplayedAsBlock',
    value: function isDisplayedAsBlock(richNode) {
      if ((0, _emberObjectMock.get)(richNode, 'type') != 'tag') return false;

      if (typeof window !== "undefined") {
        var domNode = (0, _emberObjectMock.get)(richNode, 'domNode');
        var displayStyle = window.getComputedStyle(domNode)['display'];
        return displayStyle == 'block' || displayStyle == 'list-item';
      } else {
        return false;
      }
    }
  }]);

  return RdfaContextScanner;
}();

/**
 * Shorthand form for creating a new RdfaContextScanner and analysing the supplied node with it.
 *
 * @method analyse
 * 
 * @param {Node} node Node to be analysed
 *
 * @return {[RichNode]} RichNodes containing the analysed node
 */


function analyse(node) {
  return new RdfaContextScanner().analyse(node, [0, 1000000]);
}

exports.default = RdfaContextScanner;
exports.analyse = analyse;
exports.resolvePrefixes = resolvePrefixes;
//# sourceMappingURL=rdfa-context-scanner.js.map