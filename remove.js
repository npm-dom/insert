var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = remove

function remove() {
    var list = toArray(arguments)
    list.forEach(removeFromParent)

    if (list.length === 1) {
        return list[0]
    } else {
        return document.createDocumentFragment()
    }
}

function removeFromParent(elem) {
    if (!elem.parentNode) {
        return
    }

    elem.parentNode.removeChild(elem)
}
