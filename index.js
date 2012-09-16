var slice = Array.prototype.slice
    , toArray = slice.call.bind(slice)

module.exports = {
    prepend: prepend
    , append: append
    , after: after
    , before: before
    , remove: remove
    , replace: replace
    , mutation: mutation
}

function prepend(parent) {
    var node = mutation(toArray(arguments, 1))
    parent.insertBefore(node, parent.firstChild)
}

function append(parent) {
    var node = mutation(toArray(arguments, 1))
    parent.appendChild(node)
}

function before(sibling) {
    var node = mutation(toArray(arguments, 1))
        , parent = sibling.parentNode

    parent.insertBefore(node, sibling)
}

function after(sibling) {
    var node = mutation(toArray(arguments, 1))
        , parent = sibling.parentNode
        , child = sibling.nextSibling

    parent.insertBefore(node, child)
}

function replace(target) {
    var node = mutation(toArray(arguments, 1))
        , parent = target.parentNode

    parent.replaceChild(node, target)
}

function remove() {
    var list = toArray(arguments)
    list.forEach(removeFromParent)
}

function removeFromParent(elem) {
    elem.parentNode.removeChild(elem)
}

function mutation(list) {
    list = list.map(replaceStringWithTextNode)

    if (list.length === 1) {
        return list[0]
    }

    var frag = document.createDocumentFragment()
    list.forEach(appendToFragment, frag)
    return frag
}

function replaceStringWithTextNode(string) {
    if (typeof string === "string") {
        return document.createTextNode(string)
    }

    return string
}

function appendToFragment(elem) {
    this.appendChild(elem)
}