/*global require */

var tests = require('literate-programming-cli-test')("node ../../litpro.js");

tests( 
    ["first",  "first.md second.md -s ."],
    ["build", "-b seen test.md; node ../../litpro.js -b seen/ test.md" ],
    ["checksum", "-b . --checksum awesome  project.md"],
    ["diff-change", "first.md; node ../../litpro.js -d second.md"],
    ["diff-static", "first.md; node ../../litpro.js -d second.md"],
    ["diff-new", "first.md; node ../../litpro.js -d second.md"],
    ["encoding", "-e ucs2 ucs2.md -b ."],
    ["files", "--file=first.md --file=second.md  third.md"],
    ["nofile", ""],
    ["nofilenoproject", ""],
    ["badfiles", "bad.md"],
    ["lprc", ""]
);
