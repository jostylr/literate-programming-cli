# [literate-programming-cli](# "version:0.1.1")

This is the command line portion of literate-programming. It depends on
literate-programming-lib. 



## Directory structure

* [index.js](#cli "save: | jshint") The literate program compiler is activated by a command line program.
* [README.md](#readme "save:| clean raw") The standard README.
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [LICENSE-MIT](#license-mit "save: | clean raw") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")


## Cli 

This is the command line client for literate programming. This contains all
the options for command line processing, but it comes without the standard
library of plugins. See plugins for how we deal with them.

It has different modes. The default is to take in one or more literate program
files and compile them, doing whatever they say to do, typically saving them.
There are options to specify the build and source directories. The defaults
are `./build` and `./src`, respectively, if they are present. If not present,
then the default is the directory where it is called. A root direcory can also
be specified that will change the current working directory first before doing
anything else. 

The other modes are preview and diff, both of which will not save over any
files.  


    #!/usr/bin/env node

    /*global process, require, console*/
    /*jslint evil:true*/


    var opts = require("nomnom").
        option('file', {
            abbr : "f",
            default : [],
            position : 0,
            list : true,
            help : "Literate programs to compile"
        }).
        option('test',  {
            help : "testing"
        }).
        option('test', {
            help : "test 2"
        }).
        script("litpro").
        parse();


    var fs = require('fs');
    var LitPro = require('literate-programming-lib');
    var folder = new LitPro();
    var gcd = folder.gcd;
    var colon = folder.colon;

    gcd.on("need document", function (data, evObj) {
        var rawname = evObj.pieces[0];
        var safename = colon.escape(rawname);
        fs.readFile(rawname, {encoding:'utf8'},  function (err, text) {
            if (err) {
                gcd.emit("error:file not found:" + safename);
            } else{
                folder.newdoc(safename, text);
            }
        });
    });

    gcd.on("file ready", function(text, evObj) {
        var filename = evObj.pieces[0]; 
        fs.writeFile(filename, text);
        console.log("File " + filename + " saved");
    });

    //gcd.makeLog();

    var i, n = opts.file.length;
    for (i = 0; i < n; i += 1) {
        gcd.emit("need document:" +  opts.file[i]);
    }


    process.on('exit', function () {
        var arr = folder.reportwaits();
        if ( arr.length) {
            console.log(arr.join("\n"));
        }
        //console.log(folder.scopes);
        //console.log(gcd.log.logs().join('\n')); 
    });



## Plugins

It will, however, starting with the current working directory (where the
command was issued), search out for either `lprc.js` or `node_modules`,
respectively per level up the heirarchy. This will load the plugins in lprc.js
or it will load `litpro-` modules automatically. Failing to find any of these
things, it will then look at the environment for a litpro entry pointing to a
js file. 



[junk]()   
        .option('debug', {
          abbr: 'd',
          flag: true,
          help: 'Print debugging info'
        })
        .option('config', {
          abbr: 'c',
          default: 'config.json',
          help: 'JSON file with tests to run'
        })
        .option('version', {
          flag: true,
          help: 'print version and exit',
          callback: function() {
             return "version 1.2.4";
          }
        })
        .parse();


    var fs = require('fs');
    var LitPro = require('literate-programming-lib');
    var folder = new Litpro();
    var gcd = folder.gcd;
    var colon = folder.colon;
   
    gcd.on("need document", function (rawname) {
        var safename = colon.escape(rawname);
        fs.readfile(rawname, {encoding:'utf8'},  function (err, text) {
            if (err) {
                gcd.emit("error:file not found:" + safename);
            } else {
                folder.newdoc(safename, text);
            }
        });
    });

    gcd.on("file ready", function(text, evObj) {
        var filename = evObj.pieces[0]; 
        fs.writefile(filename, text);
    });
   
    gcd.emit("need document:first.md");


## Old -- just for reference

This is the command line file. It loads the literate programming document, sends it to the module to get a doc object, and then sends the file component to the save command. 

By default, it loads the standard plugins in literate-programming-standard. This can be turned off with the -f command line option. All loaded literate programs inherit this decision. 

postCompile is a an array of arrays of the form [function, "inherit"/"", dataObj]

    #!/usr/bin/env node

    /*global process, require, console*/
    /*jslint evil:true*/
    var program = require('commander');
    var fs = require('fs');
    var Doc = require('../lib/literate-programming').Doc;
    var path = require('path');


    _"Command line options"

    var postCompile; 

    _"Post Compile function"


    if (program.preview) {
        postCompile.push([_"Preview files", {}]);
    } else if (program.diff) {
        postCompile.push([_"Diff files", {dir:dir}]);
    } else {
        postCompile.push([_"Save files", {dir: dir}]);
    }

    var standardPlugins, plugins; 

    if (!program.free) {
        standardPlugins = require('literate-programming-standard');
        _"check for lprc file"
    } else {
        standardPlugins = {};
    }

    if (!program.quiet) {
        postCompile.push([_"Cli log", {}]);
    }

    postCompile.push([_"Action cleanup", {}]);

    var doc = new Doc(md, {
        standardPlugins : standardPlugins,
        plugins : plugins,
        postCompile : postCompile, 
        parents : null,
        fromFile : null,
        inputs : inputs,
        program : program,
        verbose : verbose
    });


    _"On exit"



#### Post Compile function

This takes in a text and is called in the context of a passin object. 

[](# "js")

    postCompile = function (text) {
        var passin = this;
        var doc = this.doc;
        var steps = doc.postCompile.steps;
        var i = 0; 
        var next = _":Next function";
        next(text); 
    };
    
    postCompile.push = _"Post Compile function:push";

    postCompile.steps = [];

[Push](# "js") 

    function (arr) {
        this.steps.push(arr);
    }

[Next function](# "js") 

    function(text) {
        if (i  < steps.length) {
            var step = steps[i];
            i+= 1;
            step[0].call(passin, text, next, step[1]);
        } else {
            // done
        }

    }


#### Action cleanup

We need to delete the associated action after it is done. 

    function (text, next) {
        var doc = this.doc;
        try {
            delete doc.actions[this.action.msg];
        } catch (e) {
        }
        next(text);
    }

#### Save Files 


    function (text, next, obj) {
        var passin = this;
        var doc = passin.doc;
        if (passin.action && passin.action.filename) {
            var fname = passin.action.filename;

            process.chdir(originalroot);
            if (obj.dir) {
                process.chdir(dir);
            }            
            var cb = _":Callback ";

            fs.writeFile(fname, text, 'utf8', cb);
        } else {
            next(text);
        }
    }

[Callback Factory](# "js") 

Information about what happened with the file writing and then next is called. 

    function (err) {
        if (err) {
            doc.log("Error in saving file " + fname + ": " + err.message);
        } else {
            doc.log("File "+ fname + " saved");
        }
        next(text);
    }


#### Preview files

This is a safety precaution to get a quick preview of the output. 

    function (text, next) {
        var passin = this;
        var doc = passin.doc;
        if (passin.action && passin.action.filename) {
            var fname = passin.action.filename;
            doc.log(fname + ": " + text.length  + "\n"+text.match(/^([^\n]*)(?:\n|$)/)[1]);
        }
        next(text);
    }


#### Diff files

This is to see the changes that might occur before saving the files. 

Currently not working

    function (text, next, obj) {        
        var passin = this;
        var doc = passin.doc;
        var fname = passin.action.filename;

        process.chdir(originalroot);
        if (obj.dir) {
            process.chdir(dir);
        }

        doc.log(fname + " diff not activated yet ");
        next(text);
    }



### Cli log

This is where we report the logs. 

    function (text, next) {
        var doc = this.doc;
        var logitem;
        var i, n = doc.logarr.length;
        for (i = 0; i < n; i += 1) {
            logitem = doc.logarr.shift();
            if ( (logitem[1] || 0) <= doc.verbose) {
                console.log(logitem[0] );
            } 
        }
        next(text);
    }

### Check for lprc file

An lprc file is a JavaScript file that contains various plugin type stuff. This allows one to define it once for a project and then all the litpro programs can use it. Probably better than the require directive. 

There should be just one such file 

To find it, we start with the cwd and look for such files in each parent directory. 

This can be made more complicated if there is a reason to do so, but I think a single plugin file for a project is probably sufficient. There is always require. 


[](# "js: ife")

    var original = process.cwd();
    var files;

    var matchf = function (el) {return el.match("lprc.js");};

    var current;
    plugins = {};
    var bits = original.split(path.sep);
    var lead = ( original[0] === path.sep) ? path.sep : "";
    do {
        current = lead + path.join.apply(path, bits);
        files = fs.readdirSync(current);
        files = files.filter(matchf);
        if (files.length === 1 ) {
            plugins = require(current+path.sep+files[0]);
            break;
        } else {
            bits.pop();
        }
    } while (bits.length > 0);





### Command line options

Here we define what the various configuration options are. 

The preview option is used to avoid overwriting what exists without checking first. Eventually, I will hookup a diff view. There might also be a test-safe mode which runs the tests and other stuff and will not save if they do not pass. 

Added ability to pass in arguments to the literate program. It is in the array variable inputs.

    program
        .version('DOCVERSION')
        .usage('[options] <file> <outdir> <arg1> ...')
        .option('-o --output <root>', 'Root directory for output')
        .option('-i --input <root>',  'Root directory for input')
        .option('-r --root <root>', 'Change root directory for both input and output')
        .option('-p --preview',  'Do not save the changes. Output first line of each file')
        .option('-f --free', 'Do not use the default standard library of plugins') 
        .option('-d --diff', 'Compare diffs of old file and new file')
        .option('-e --extension <ext>', 'requires a ext as extension for the file')
        .option('--verbose', 'Full warnings turned on')
    ;

    program.parse(process.argv);

    if ((! program.args[0]) ) {
        console.log("Need a file");
        process.exit();
    }


    var dir = program.dir || program.root || program.args[1] || process.cwd(); 
    var indir = program.change || program.root || process.cwd();
    var originalroot = process.cwd();
    if (indir) {
        process.chdir(indir);
    }

    var verbose = program.verbose || 0;

    if (program.extension) {
        if (program.args[0].substr(-program.extension.length) !== program.extension) {
            console.log("Requires extension: " + program.extension);
            process.exit();
        }
    }

    var md;
    try {
        md = fs.readFileSync(program.args[0], 'utf8');
    } catch (e) {
        console.log("Not readable file " + program.args[0]);
        md = ""; 
    }

    var inputs =  program.args.slice(2);

#### On exit

    process.on('exit', function () {
        if (Object.keys(doc.waiting).length > 0 ) {
            console.log("The following blocks failed to compile: \n",  Object.keys(doc.waiting).join("\n "));
        } 
        if (Object.keys(doc.actions).length > 0 ) {
            console.log("The following actions failed to execute: \n",  Object.keys(doc.actions).join("\n "));
        } 

        var fdoc, fdocname;
        for (fdocname in doc.repo.litpro) {
            fdoc = doc.repo.litpro[fdocname]; 
            if (Object.keys(fdoc.waiting).length > 0 ) {
                console.log("The following blocks in "+fdocname+" failed to compile: \n",  Object.keys(fdoc.waiting).join("\n "));
            } 
            if (Object.keys(fdoc.actions).length > 0 ) {
                console.log("The following actions in "+fdocname+" failed to execute: \n",  Object.keys(fdoc.actions).join("\n "));
            }
        } 
    });



## References

I always have to look up the RegEx stuff. Here I created regexs and used their [exec](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec) method to get the chunks of interest. 

[MDN RegExp page](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp)

Also of invaluable help with all of this is [RegExpr](http://www.regexper.com/)


## README


literate-programming-cli   
 ====================

This is the command line client for literate-programming. 

!! Currently not working nor published!

Install using `npm install literate-programming-cli`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 

If you want a global install so that you just need to write `litpro` then use
`npm install -g literate-programming-cli`. 




 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)



## TODO


## NPM package

The requisite npm package file. 

[](# "json") 

    {
      "name": "DOCNAME",
      "description": "A literate programming compile script. Write your program in markdown.",
      "version": "DOCVERSION",
      "homepage": "https://github.com/jostylr/literate-programming-cli",
      "author": {
        "name": "James Taylor",
        "email": "jostylr@gmail.com"
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/jostylr/literate-programming-cli.git"
      },
      "bugs": {
        "url": "https://github.com/jostylr/literate-programming-cli/issues"
      },
      "licenses": [
        {
          "type": "MIT",
          "url": "https://github.com/jostylr/literate-programming-cli/blob/master/LICENSE-MIT"
        }
      ],
      "main": "index.js",
      "engines": {
        "node": ">=0.10"
      },
      "dependencies":{
          "nomnom": "^1.8.1",
          "literate-programming-lib" : "^1.0.3"
      },
      "devDependencies" : {
      },
      "scripts" : { 
        "test" : "node ./test.js"
      },
      "keywords": ["literate programming"],
      "bin": {
        "litpro" : "./index.js"
      }
    }


## gitignore

    node_modules

## npmignore


    tests
    test.js
    travis.yml
    node_modules
    *.md


## Travis

A travis.yml file for continuous test integration!

    language: node_js
    node_js:
      - "0.10"
      - "0.12"
      - "iojs"



## LICENSE MIT


The MIT License (MIT)
Copyright (c) 2015 James Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The software is provided "as is", without warranty of any kind, express or
implied, including but not limited to the warranties of merchantability,
fitness for a particular purpose and noninfringement. In no event shall the
authors or copyright holders be liable for any claim, damages or other
liability, whether in an action of contract, tort or otherwise, arising from,
out of or in connection with the software or the use or other dealings in the
software.


## Change Log

