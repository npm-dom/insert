var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = append

function append(parent) {
    var node = mutation(toArray(arguments, 1))
    return parent.appendChild(node)
}
