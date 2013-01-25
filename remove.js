var toArray = require("to-array")

    , mutation = require("./mutation")

module.exports = remove

function remove(first) {
    var list = toArray(arguments)
    list.map(function (elem) {
        if (elem && elem.view && elem.view.nodeType) {
            return elem.view
        }

        return elem
    }).forEach(removeFromParent)

    return first
}

function removeFromParent(elem) {
    if (!elem.parentNode) {
        return
    }

    elem.parentNode.removeChild(elem)
}
