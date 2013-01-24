var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = after

function after(sibling, first) {
    var node = mutation(toArray(arguments, 1))
        , parent = sibling.parentNode
        , child = sibling.nextSibling

    parent.insertBefore(node, child)
    return first
}
