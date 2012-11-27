var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = remove

function remove() {
    var list = toArray(arguments)
    list.forEach(removeFromParent)
}

function removeFromParent(elem) {
    if (!elem.parentNode) {
        return
    }

    elem.parentNode.removeChild(elem)
}
