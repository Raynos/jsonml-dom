module.exports = getPrimitives

/*  getPrimitives := ({
        primitives: Object<String, Primitive>
    }, JsonML) => Primitive
*/
function getPrimitives(opts, tree) {
    var primitives = opts.primitives
    var key = getPrimitiveKey(tree)

    return primitives[key] || null
}

// getPrimitiveKey := (Plugin) => String
function getPrimitiveKey(plugin) {
    if (typeof plugin === "function") {
        return "#function"
    }

    return plugin.primitive
}
