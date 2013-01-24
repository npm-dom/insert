var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = prepend

function prepend(parent, first) {
    var node = mutation(toArray(arguments, 1))
    parent.insertBefore(node, parent.firstChild)
    return first
}
