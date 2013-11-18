var globalDocument = require("global/document")
var DataSet = require("data-set")

var getPrimitive = require("./lib/get-primitive.js")
var isPrimitive = require("./lib/is-primitive.js")
var JSONMLReducer = require("./lib/jsonml-reducer.js")

module.exports = JSONMLReducer({
    initialize: function initialize(opts) {
        opts.document = opts.document || globalDocument
    },
    createPrimitive: function createPrimitive(opts, tree, primitive) {
        return primitive.dom(opts, tree)
    },
    createElement: function createElementContext(opts, properties) {
        var tagName = properties.tagName.toUpperCase()
        var elem = opts.document.createElement(tagName)
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
