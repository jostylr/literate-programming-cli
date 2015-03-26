# Testing the Client

Here we need to test the client. For each test, we will use an external node
called in by command line. This seems like the appropriate way to ensure
compatibility. 


* [test.js](#the-test-framework "save: |jshint")
* [test2.js](#the-new-test-framework "save: |jshint")

## The new test framework

This uses the new test framework in which everything is done by setting up the
directories. 

    var litpro = require('./index.js');
    var tests = litpro.tests("node ../../litpro.js");

    tests( 
        ["notsave", "-b seen test.md" ],
        ["first",  "first.md second.md"]
    );



## The test framework

    var test = require('tape');
    var EvW = require('event-when');
    var fs = require('fs');
    var exec = require('child_process').exec;

    var cbmaker = _"make callbacks";

    _"first test";

    _"no change";


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

## No Change

This makes sure there is no change when, well, there is no change. 

    test('first test', function (t) {

        var gcd = new EvW();

        t.plan(1);

        gcd.on("test", function (data) {

            t.equal(data,
                "UNCHANGED ./seen/out.txt\n" +
                "DONE: ./seen\n"
            );

        });
 
        exec("cd tests/notsave;" +
            " node ../../litpro.js -b seen test.md",
            cbmaker("test", gcd)
        );
            

    })

    
