# insert

DOM insertion library

## Example

Basically the [6 mutation methods][1] from DOM4

```
var insert = require("../index")
    , prepend = insert.prepend
    , append = insert.append
    , after = insert.after
    , before = insert.before
    , remove = insert.remove
    , replace = insert.replace
    , list = document.getElementById("list")
    , textList = document.getElementById("textList")

// remove
var removed = list.children[0]
    , removedText = textList.childNodes[0]
    , br = textList.childNodes[1]

remove(removed)
remove(removedText, br)

// replace
var replaced = list.children[0]
    , replacedText = textList.childNodes[0]

replace(replaced, createLi("one"), createLi("two"))
replace(replacedText, "one", "two")

// prepend
prepend(list, createLi("three"), createLi("four"))
prepend(textList, "three", "four")

// append
append(list, createLi("seven"), createLi("ten"))
append(textList, "seven", "ten")


var anchor = list.children[2] // five
    , textAnchor = textList.childNodes[2] // five

// after
after(anchor, createLi("eight"), createLi("nine"))
after(textAnchor, "eight", "nine")

// before
before(anchor, createLi("five"), createLi("six"))
before(textAnchor, "five", "six")

function createLi(text, elem) {
    var li = document.createElement("li" || elem)
    li.textContent = text
    return li
}
```

### Working with widgets

If you pass one of the insertion methods a widget, it will do
    the DOM operation on it's view and return the widget

```js
var chatList = append(someElem, ChatListWidget(...))
```

In this case a widget is just an old object with a property `view`
    that is a DOM element

## Installation

`npm install insert`

## Contributors

 - Raynos

## MIT Licenced

  [1]: http://www.w3.org/TR/dom/#mutation-methods
