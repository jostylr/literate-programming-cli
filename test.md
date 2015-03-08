# Testing the Client

Here we need to test the client. For each test, we will use an external node
called in by command line. This seems like the appropriate way to ensure
compatibility. 


* [test.js](#the-test-framework "save: |jshint")


## The test framework

    var test = require('tape');
    var EvW = require('event-when');
    var fs = require('fs');
    var exec = require('child_process').exec;

    var cbmaker = _"make callbacks";

    _"first test";


## Make callbacks

This is a function that takes in en event name and returns a callback that
logs errors and emits the data with the given event name upon success.

    function (evt, gcd) {
        return function (err, data) {
            if (err) {
                console.log(err);
            } else {
                gcd.emit(evt, data);
            }
        };
    }   

## First test

This is our first test. 

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

    })



