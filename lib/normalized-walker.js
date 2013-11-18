var Walker = require("jsonml-walk")

var normalize = require("./normalize.js")

module.exports = NormalizedWalker

function NormalizedWalker(walkerOpts, initialize) {
    var walker = Walker(walkerOpts)

    return createWalker

    function createWalker(primitives) {
        var primitivesHash = primitives.reduce(function (acc, item) {
            acc[item.primitive] = item
            return acc
        }, {})

        return normalizeAndWalk

        function normalizeAndWalk(tree, opts) {
            opts = opts || {}

            if (initialize) {
                opts = initialize(opts)
            }

            tree = normalize(tree, opts, primitivesHash)

            return walker(tree, opts)
        }
    }
}
