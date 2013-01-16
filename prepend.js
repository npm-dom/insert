var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = prepend

function prepend(parent) {
    var node = mutation(toArray(arguments, 1))
    return parent.insertBefore(node, parent.firstChild)
}
