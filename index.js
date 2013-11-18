var globalDocument = require("global/document")

var NormalizedWalker = require("./lib/normalized-walker.js")
var getPrimitive = require("./lib/get-primitive.js")
var isPrimitive = require("./lib/is-primitive.js")
var unpackSelector = require("./lib/unpack-selector.js")

module.exports = NormalizedWalker({
    onPlugin: function (opts, tree) {
        var primitive = getPrimitive(opts, tree)
        var elem = createPrimitive(opts, tree, primitive)
        return appendToContext(opts, elem)
    },
    onNode: function (opts, selector, properties) {
        if (selector === "#text") {
            var content = properties.value
            var primitive = null
            if (isPrimitive(content)) {
                primitive = getPrimitive(opts, content)
            }

            var elem = createTextNode(opts, content, primitive)
            return appendToContext(opts, elem)
        }

        unpackSelector(opts, selector, properties)

        var elem = createElement(opts, properties)
        return appendToContext(opts, elem)
    }
}, function initialize(opts) {
    opts.document = opts.document || globalDocument
})

function createElement(opts, properties) {
    
}

function createPrimitive(opts, tree, primitive) {
    return primitive.dom(opts, tree)
}

// createTextNode := 
//   (ContextOptions, String | Primitive, PrimitiveImplementation) => Context
function createTextNode(opts, content, primitive) {
    var textNode = opts.document.createTextNode()
    if (primitive) {
        primitive.renderTextContent(opts, textNode, content)
    } else {
        textNode.value = content
    }
    return textNode
}

// appendToContext := (ContextOptions, DOMElement) => DOMElement
function appendToContext(opts, elem) {
    var context = opts.parent && opts.parent.context

    if (elem && context) {
        context.appendChild(elem)
    }

    return elem
}
