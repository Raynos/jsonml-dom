var extend = require("xtend")

module.exports = normalize

function normalize(opts, tree, primitivesHash) {
    opts.primitives = extend(primitivesHash, opts.primitives || {})

    Object.keys(opts.primitives).forEach(function (key) {
        var primitive = opts.primitives[key]
        if (typeof primitive.normalize === "function") {
            tree = primitive.normalize(opts, tree)
        }
    })

    return tree
}
