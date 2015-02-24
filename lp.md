# [literate-programming-cli](# "version:0.2.1")

This is the command line portion of literate-programming. It depends on
literate-programming-lib. 


At the moment, at least, I am of the firm opinion that one should structure a
litpro directory as cache, build, src, lprc.js  as where you start. These
locations can be changed in the command line, but the idea is that you are at
the top, it all goes down. 

Any initially given filenames are read as is. This allows for shell
completion. It is a little odd in that command line is non-prefixed while
loading from within doc is prefixed. One can also specify starting files in
lprc.js by modifying args.files. 

## Directory structure

* [litpro.js](#cli "save: | jshint") The literate program compiler is activated by a command line program.
* [index.js](#module "save: | jshint") This is the module which can then be
  used for making further command line clients with other functionality. 
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

    var mod = require('./index.js');

    var args = mod.opts.parse();

    //console.log(args);

    mod.Folder.lprc(args.lprc, args);

    var folder = new mod.Folder();

    folder.process(args);

    process.on('exit', function () {
        folder.exit();
    });


 
## Module

This exports what is needed for the command client to use. 

The directories are a bit tricky. 


    /*global process, require, console, module*/

    var fs = require('fs');
    var path = require('path');
    var sep = path.sep;
    var Folder = require('literate-programming-lib');
    var mkdirp = require('mkdirp');

    var root = process.cwd();
    var build, src, cache;

    _"preload"
    
    _"encodings"

    var opts = require("nomnom").
        options(_"cli options").
        script("litpro");

    Folder.lprc = _"lprc";

    module.exports.Folder = Folder;
    module.exports.opts = opts;


## Preload

We can prep the Folder object first and then later we will load the plugin stuff
that may want to modify these things. 
 
Actions pertain to gcd stuff. We can setup things before and it will get
applied. postInit takes the instance folder and allows one last bit of
something. For example, we could enable logging with the gcd. 



    var loader = _"actions:load file";

    Folder.actions = _"actions";
    
    Folder.prototype.encoding = "utf8";

    Folder.prototype.exit = _":exit";

    Folder.prototype.process = _":process";


    
[exit]()

The function to run on exiting. 

    function () {
        var folder = this;
        var arr = folder.reportwaits();
        if ( arr.length) {
            console.log(arr.join("\n"));
        } else {
            console.log("Nothing reports waiting.");
        }

        //console.log(folder, folder.gcd);
        
        //console.log(folder.scopes);
        //console.log(gcd.log.logs().join('\n')); 
    }


[process]()

This is what happens after all the initiation and parsing of cli options. It
actually initiates the compiling. It receives the parsed arguments. 

    function (args) {
        var folder = this;
        var gcd = folder.gcd;
        var colon = folder.colon;
        var emitname;

        folder.build = args.build;
        folder.cache = args.cache;
        folder.src = args.src;

        var i, n = args.file.length;
        for (i = 0; i < n; i += 1) {
            emitname = colon.escape(args.file[i]);
            gcd.emit("initial document:" +  emitname);
        }
    
    }

    

## Actions    

We have two basic actions, one for getting a requested document and one for
saving one. 

    {"on" : [
        ["initial document", "read initial file"],
        ["need document", "read file"],
        ["file ready", "save file"],
        ["error", "report error"] ],
     "action" : [
        ["read initial file", function (data, evObj) {
            loader(data, evObj, "");
        }],
        ["read file", loader], 
        ["save file",  function(text, evObj) {
            var gcd = evObj.emitter;
            var folder = gcd.parent;
            var colon = folder.colon;
            var emitname = evObj.pieces[0];
            var filename = colon.restore(emitname);
            var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
            var fpath = folder.build;
            var fullname = fpath + sep + filename;
            fs.writeFile(fullname, text, 
                {encoding:encoding},  function (err) {
                if (err) {
                    _":mkdirp";
                } else{
                    console.log("File " + fullname + " saved");
                }
            });
        }],
        ["report error", function (data, evObj) {
            console.log(evObj.ev + (data ? " INFO: " + data : "") );
        }]]
    }

[mkdirp]()

This makes the directory if it does not exist. 

    mkdirp(fpath, function (err) {
        if (err) {
            gcd.emit("error:directory not makeable", fpath);
        } else {
            fs.writeFile(fullname, text, 
                {encoding:encoding},  function (err) {
                    if (err) {
                        gcd.emit("error:file not saveable",fullname);
                    } else {
                        console.log("File " + fullname + " saved");
                    }
                });
        }
    })


[load file]() 

     function (data, evObj, src) {
            var gcd = evObj.emitter;
            var folder = gcd.parent;
            var colon = folder.colon;
            var emitname = evObj.pieces[0];
            var filename = colon.restore(emitname);
            var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
            var fullname = ((typeof src === "string") ? src : folder.src + sep ) +
                 filename;
            fs.readFile( fullname, {encoding:encoding},  function (err, text) {
                if (err) {
                    gcd.emit("error:file not found:" + fullname);
                } else {
                    folder.newdoc(emitname, text);
                }
            });
     }
      
## Encodings

This enables us to read files of various different encodings. We use
iconv-lite. 

    var iconv = require('iconv-lite'); 
    iconv.extendNodeEncodings();
 
This should turn read and write files into wonderful manifold encodings. 

[option]() 

    { 
        abbr : "e",
        default : "utf8",
        help : "default encoding to use. Defaults to utf8",
        callback : function (enc) {
            if (iconv.encodingExists(enc) ) {
                Folder.prototype.encoding = enc;
            } else {
                return "Bad encoding. Please check iconv.lite's list of encodings.";
            }
        }
    }


## CLI Options

Here are the options for the nomnom parser. These get loaded first and then the
plugins can act on the parsr as a second argument. The plugins should be able
to overwrite whatever they like in it though ideally they play nice. 

    {
        "file": {
            abbr : "f",
            default : [],
            position : 0,
            list : true,
        }, 
        "encoding" : _"encodings:option",
        _":dir",
        "lprc": {
            abbr : "l",
            default : root + sep + "lprc.js",
        }

    }


[dir]()

This sets up the default directories. 

    build : {
        abbr: "b",
        default : root + sep + "build"
    },
    src : {
        abbr: "s",
        default : root + sep + "src"
    },
    cache : {
        abbr : "c",
        default : root + sep + "cache"
    }
    

## LPRC

The plugins are managed by a lprc.js or by scanning `node_modules`. For now,
we will simply load a lprc.js file in the current working directory. In the
future, we will scan upwards. 

The lprc.js file should return a function which is also what plugins should
do. They modify properties on Folder, namely commands, directives, and
actions. Actions are the gcd events that get applied upon folder creation.  

This will do more searching and alternatives later.

Modifying Folder.postInit allows for a function to process `this` on
instantiation. 


    function (name, args) {
        var Folder = this;

        try {
            require(name)(Folder, args);
        } catch (e) {
            
        }
    }
   






## Plugins

It will, however, starting with the current working directory (where the
command was issued), search out for either `lprc.js` or `node_modules`,
respectively per level up the heirarchy. This will load the plugins in lprc.js
or it will load `litpro-` modules automatically. Failing to find any of these
things, it will then look at the environment for a litpro entry pointing to a
js file. 




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

preview, diff command mode

build, src

extensions

readfile, directory, writefile commands for use from a litpro doc.

maybe a built in watcher program, using nodemon?  
command line: read file, readdir, write file, file encodings, curling, creating subdir — init stuff

plugins: version--npm stuff, jshint, jstidy, jade, markdown, 

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
          "literate-programming-lib" : "^1.2.1",
          "iconv-lite" : "^0.4.7",
          "mkdirp": "^0.5.0"
      },
      "devDependencies" : {
      },
      "scripts" : { 
        "test" : "node ./test.js"
      },
      "keywords": ["literate programming"],
      "bin": {
        "litpro" : "./litpro.js"
      }
    }


## gitignore

    node_modules
    build

## npmignore


    build
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

