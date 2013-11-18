var globalDocument = require("global/document")
var DataSet = require("data-set")

var NormalizedWalker = require("./lib/normalized-walker.js")
var getPrimitive = require("./lib/get-primitive.js")
var isPrimitive = require("./lib/is-primitive.js")
var unpackSelector = require("./lib/unpack-selector.js")


module.exports = JSONMLReducer({
    initialize: function initialize(opts) {
        opts.document = opts.document || globalDocument
    },
    createPrimitive: function createPrimitive(opts, tree, primitive) {
        return primitive.dom(opts, tree)
    },
    createElement: function createElementContext(opts, properties) {
        var elem = opts.document.createElement(properties.tagName.toUpperCase())
        return elem
    },
    createTextNode: function createTextNode(opts, content, primitive) {
        var textNode = opts.document.createTextNode()
        if (primitive) {
            primitive.renderTextContent(opts, textNode, content)
        } else {
            textNode.value = content
        }
        return textNode
    },
    appendToContext: function appendToContext(opts, elem) {
        var context = opts.parent && opts.parent.context

        if (elem && context) {
            context.appendChild(elem)
        }

        return elem
    },
    propertyHandlers: {
        "style": function renderStyle(opts, elem, value) {
            Object.keys(value).forEach(function (key) {
                var styleValue = value[key]

                if (!elem.style) {
                    elem.style = {}
                }

                if (isPrimitive(styleValue)) {
                    getPrimitive(opts, styleValue)
                        .renderStyle(opts, elem, styleValue, key)
                } else {
                    elem.style[key] = styleValue
                }
            })
        },
        "dataset": function dataAttributes(opts, elem, dataset) {
            var ds

            Object.keys(dataset).forEach(function (key) {
                var value = dataset[key]

                if (!ds) {
                    ds = DataSet(elem)
                }

                if (isPrimitive(value)) {
                    getPrimitive(opts, value)
                        .renderDataSet(opts, elem, value, key)
                } else {
                    ds[key] = value
                }
            })
        }
    },
    handleProperty: function property(opts, elem, value, key, primitive) {
        if (primitive) {
            primitive.renderProperty(opts, elem, value, key)
        } else {
            elem[key] = value
        }
    }
})

function JSONMLReducer(options) {
    var createPrimitive = options.createPrimitive
    var createElement = options.createElement
    var appendToContext = options.appendToContext
    var createTextNode = options.createTextNode
    var propertyHandlers = options.propertyHandlers
    var handleProperty = options.handleProperty

    return NormalizedWalker({
        onPlugin: function (opts, tree) {
            var primitive = getPrimitive(opts, tree)
            var context = createPrimitive(opts, tree, primitive)
            return appendToContext(opts, context)
        },
        onNode: function (opts, selector, properties) {
            var context
            if (selector === "#text") {
                var content = properties.value
                var primitive = null
                if (isPrimitive(content)) {
                    primitive = getPrimitive(opts, content)
                }

                context = createTextNode(opts, content, primitive)
                return appendToContext(opts, context)
            }

            unpackSelector(opts, selector, properties)

            context = createElement(opts, properties)

            Object.keys(properties).forEach(function (key) {
                var value = properties[key]
                var handler = handleProperty

                if (propertyHandlers[key]) {
                    handler = propertyHandlers[key]
                    handler(opts, context, value, key)
                } else {
                    var primitive = null
                    if (isPrimitive(value)) {
                        primitive = getPrimitive(opts, value)
                    }
                    handleProperty(opts, context, value, key, primitive)
                }
            })

            return appendToContext(opts, context)
        }
    }, options.initialize)
}
