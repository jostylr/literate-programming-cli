var litpro = require('./index.js');
var tests = litpro.tests("node ../../litpro.js");

tests( 
    ["notsave", "-b seen test.md" ],
    ["first",  "first.md second.md"]
);
