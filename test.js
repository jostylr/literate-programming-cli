var litpro = require('./index.js');
var tests = litpro.tests("node ../../litpro.js");

tests( 
    ["notsave", "-b seen test.md" ],
    ["first",  "-b seen first.md second.md"]
);
