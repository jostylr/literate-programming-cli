/*global require */

var tests = require('literate-programming-cli-test')("node ../../litpro.js");

tests( 
    ["first",  "first.md second.md"],
    ["build", "-b seen test.md; node ../../litpro.js -b seen/ test.md" ],
    ["checksum", "-b . --checksum awesome  project.md"],
    ["diff", "first.md; node ../../litpro.js -d second.md"],
    ["encoding", "-e ucs2 ucs2.md -b ."],
    ["lprc", ""]
);
