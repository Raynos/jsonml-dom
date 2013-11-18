var test = require("tape")

var Dom = require("../index")
var dom = Dom()

test("Dom is a function", function (assert) {
    assert.equal(typeof Dom, "function")
    assert.end()
})

test("dom properly converts jsonml to element", function (assert) {
    var elem = dom(["html", {}, [
        ["head", { className: "head" }, [
            ["meta", { charset: "utf-8" }, []],
            ["title", {}, [
                ["#text", { value: "Process dashboard" }, []]
            ]],
            ["link", { rel: "stylesheet", href: "/less/main" }, []]
        ]],
        ["body", { className: "main" }, [
            ["script", { src: "/browserify/main" }, []]
        ]]
    ]])

    assert.ok(elem)
    assert.equal(elem.tagName, "HTML")
    assert.equal(elem.childNodes.length, 2)

    assert.equal(elem.childNodes[0].tagName, "HEAD")
    assert.equal(elem.childNodes[0].className, "head")
    assert.equal(elem.childNodes[1].tagName, "BODY")
    assert.equal(elem.childNodes[1].className, "main")

    assert.end()
})


test("style properties", function (assert) {
    var elem = dom(["div", {
        style: { borderColor: "black" }
    }, []])

    assert.equal(elem.style.borderColor, "black")

    assert.end()
})
