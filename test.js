var test = require('tape');
var EvW = require('event-when');
var fs = require('fs');
var exec = require('child_process').exec;

var cbmaker = function (evt, gcd) {
    return function (err, data) {
        if (err) {
            console.log(err);
        } else {
            gcd.emit(evt, data);
        }
    };
}   ;

test('first test', function (t) {

    var gcd = new EvW();

    t.plan(1);

    gcd.on("test", function (data) {
        var compare = {};
        data.forEach(function (el) {
            compare[el[0]] = el[1];
        });

        t.equal(compare.compiled, compare.read);

    });

    gcd.on("saved", function () {
        fs.readFile("tests/first/build/first.txt", 'utf8', cbmaker("compiled", gcd) );
    }) ;
    
    gcd.when(["compiled", "read"], "test");
    
    exec("cd tests/first; rm -rf build/;" +
        " node ../../litpro.js first.md second.md",
        cbmaker("saved", gcd)
    );
        

    fs.readFile("tests/first/first.txt", 'utf8', cbmaker("read", gcd) );

});

test('first test', function (t) {

    var gcd = new EvW();

    t.plan(1);

    gcd.on("test", function (data) {

        t.equal(data,
            "UNCHANGED ./seen/out.txt\n" +
            "./seen: Nothing reports waiting.\n"
        );

    });

    exec("cd tests/notsave;" +
        " node ../../litpro.js -b seen test.md",
        cbmaker("test", gcd)
    );
        

});
