var toArray = require("to-array")
    , mutation = require("./mutation")

module.exports = replace

function replace(target) {
    var node = mutation(toArray(arguments, 1))
        , parent = target.parentNode

    parent.replaceChild(node, target)
}
