var encode = require("ent").encode

var NormalizedWalker = require("./lib/normalized-walker.js")
var getPrimitive = require("./lib/get-primitive.js")
var isPrimitive = require("./lib/is-primitive.js")
var unpackSelector = require("./lib/unpack-selector.js")

var endingScriptTag = /<\/script>/g

var isDoubleQuote = /"/g
var isSingleQuote = /'/g
var camelCase = /([a-z][A-Z])/g

module.exports = JSONMLReducer({
    createPrimitive: function createPrimitive(opts, tree, primitive) {
        return primitive.stringify(opts, tree)
    },
    createTextNode: function createTextNode(opts, content, primitive) {
        if (primitive) {
            return primitive.stringifyTextContent(opts, content)
        } else {
            return escapeHTMLTextContent(opts, content)
        }
    },
    createElement: function createElement(opts, properties) {
        return { tagName: properties.tagName, attrs: [] }
    },
    finishElement: function finishElement(opts, properties) {
        return "</" + properties.tagName + ">"
    },
    appendToContext: function (opts, context) {
        var strings = (opts.parent && opts.parent.context) || []

        // then its { tagName, attrs }
        var str
        if (typeof context !== "string") {
            var attrString = context.attrs.join(" ").trim()
            attrString = attrString === "" ? "" : " " + attrString
            str = "<" + context.tagName + attrString + ">"
        } else {
            str = context
        }

        strings.push(str)

        return strings
    },
    propertyHandlers: {
        "style": function stringifyStyle(opts, context, styles) {
            var attr = ""
            Object.keys(styles).forEach(function (key) {
                var value = styles[key]
                attr += hyphenate(key) + ": " + value + ";"
            })
            
            context.attrs.push("style=\"" + escapeHTMLAttributes(attr) + "\"")
        },
        "dataset": function stringifyDataSet(opts, context, dataset) {
            var attrs = context.attrs
            Object.keys(dataset).forEach(function (key) {
                var value = dataset[key]
                attrs.push("data-" + hyphenate(key) + "=\"" +
                    escapeHTMLAttributes(value) + "\"")
            })
        }
    },
    handleProperty: function property(opts, context, value, key, primitive) {
        var attr
        if (primitive) {
            attr = primitive.stringifyProperty(opts, value, key)
        } else if (value === true) {
            attr = key
        } else if (value === false) {
            attr = ""
        } else {
            attr = key + "=\"" + escapeHTMLAttributes(value) + "\""
        }

        context.attrs.push(attr)
    }
})


function hyphenate(key) {
    return key.replace(camelCase, function (group) {
        return group[0] + "-" + group[1].toLowerCase()
    })
}

function escapeHTMLAttributes(s) {
    return String(s)
        .replace(isDoubleQuote, "&quot;")
        .replace(isSingleQuote, "&#39;")
}


function escapeHTMLTextContent(opts, string) {
    var tagName = opts.parent ? opts.parent[1].tagName : ""
    var escaped = String(string)

    if (tagName !== "script" && tagName !== "style") {
        escaped = encode(escaped)
    } else if (tagName === "script") {
        escaped = escaped.replace(endingScriptTag, "<\\\/script>")
    }

    return escaped
}


function JSONMLReducer(options) {
    var createPrimitive = options.createPrimitive
    var createElement = options.createElement
    var appendToContext = options.appendToContext
    var createTextNode = options.createTextNode
    var propertyHandlers = options.propertyHandlers
    var handleProperty = options.handleProperty
    var finishElement = options.finishElement

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
        },
        onNodeAfter: function (opts, selector, properties) {
            if (!finishElement) {
                return
            }

            var context = finishElement(opts, properties)

            return appendToContext(opts, context)
        }
    }, options.initialize)
}
