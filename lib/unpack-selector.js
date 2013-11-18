var isPrimitive = require("./is-primitive.js")
var getPrimitive = require("./get-primitive.js")

var splitSelectorRegex = /([\.#]?[a-zA-Z0-9_-]+)/

module.exports = unpackSelector

function unpackSelector(options, selector, properties) {
    var selectorMatches = selector.split(splitSelectorRegex)
    var tagName = "div"

    selectorMatches.forEach(function (match) {
        var value = match.substring(1, match.length)

        if (match[0] === ".") {
            setClassName(properties, function (currentClass) {
                return currentClass + value + " "
            }, options)
        } else if (match[0] === "#") {
            properties.id = value
        } else if (match.length > 0) {
            tagName = match
        }
    })

    properties.tagName = tagName

    if (properties.className) {
        setClassName(properties, function (curr) {
            return curr.trim()
        }, options)
    }
}

function setClassName(properties, lambda, options) {
    var className = properties.className
    if (isPrimitive(className)) {
        var primitive = getPrimitive(options, className)
        var currValue = primitive.getProperty(className, "className")
        var newValue = lambda(currValue)
        primitive.setProperty(className, newValue, "className")
    } else {
        properties.className = lambda(className || "")
    }
}
