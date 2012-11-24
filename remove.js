var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = remove

function remove() {
    var list = toArray(arguments)
    list.forEach(removeFromParent)
}

function removeFromParent(elem) {
    elem.parentNode.removeChild(elem)
}
