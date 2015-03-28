/*global require */

var tests = require('literate-programming-cli-test')("node ../../litpro.js");

tests( 
    ["first",  "first.md second.md"],
    ["build", "-b seen test.md" ],
    ["checksum", "-b . --checksum awesome  project.md"],
    ["lprc", ""],
    ["encoding", "-e ucs2 ucs2.md -b ."]
);
