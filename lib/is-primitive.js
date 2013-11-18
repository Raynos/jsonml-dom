module.exports = isPrimitive

function isPrimitive(obj) {
    return !Array.isArray(obj) && (isObject(obj) || typeof obj === "function")
}

function isObject(obj) {
    return typeof obj === "object" && obj !== null
}
