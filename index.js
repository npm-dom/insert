var mutation = require("./mutation")
    , prepend = require("./prepend")
    , append = require("./append")
    , after = require("./after")
    , before = require("./before")
    , remove = require("./remove")
    , replace = require("./replace")

module.exports = {
    prepend: prepend
    , append: append
    , after: after
    , before: before
    , remove: remove
    , replace: replace
    , mutation: mutation
}
