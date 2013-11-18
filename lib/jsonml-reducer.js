var NormalizedWalker = require("./normalized-walker.js")
var getPrimitive = require("./get-primitive.js")
var isPrimitive = require("./is-primitive.js")
var unpackSelector = require("./unpack-selector.js")

module.exports = JSONMLReducer

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
