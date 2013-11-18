var test = require("tape")

var jsonmlDom = require("../index")

test("jsonmlDom is a function", function (assert) {
    assert.equal(typeof jsonmlDom, "function")
    assert.end()
})
