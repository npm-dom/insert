var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = append

function append(parent, first) {
    var node = mutation(toArray(arguments, 1))
    parent.appendChild(node)
    return first
}
