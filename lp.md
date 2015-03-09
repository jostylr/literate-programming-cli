# [literate-programming-cli](# "version:0.7.2")

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

    var Folder = mod.Folder;

    Folder.lprc(args.lprc, args);

    Folder.cache.firstLoad(args.cache, args.cachefile);

    Folder.process(args);

    process.on('exit', Folder.exit());



 
## Module

This exports what is needed for the command client to use. 

The directories are a bit tricky. 


    /*global process, require, console, module*/

    var fs = require('fs');
    var path = require('path');
    var sep = path.sep;
    var Folder = require('literate-programming-lib');
    var mkdirp = require('mkdirp');
    var exec = require('child_process').exec;
    var needle = require('needle');
    var diff = require('diff');
    var colors = require('colors/safe');
    var crypto = require('crypto');
    
    var root = process.cwd() + sep;

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

    _"new directives"

    _"new commands"
    
    Folder.prototype.encoding = "utf8";

    Folder.exit = _":exit";

    Folder.process = _":process";

    Folder.cache = _"cache";

    var checksum = Folder.checksum = _"checksum";

    Folder.folders = {};

    Folder.execseparator = "!*!";

    _"fcd"



    
[exit]()

The function to run on exiting. This actually is a function closure around the
event. 

    function () {
        var Folder  = this; 

         return function () {
            var build, folder, arr;
            var folders = Folder.folders; 
                
            Folder.cache.finalSave();
    
            for ( build in folders) {
                folder = folders[build];
                arr = folder.reportwaits();
           
                if ( arr.length) {
                    console.log( "./" + build.replace(root, "") +
                    "\n---\n" + arr.join("\n") + "\n\n");
                } else {
                    console.log( "./"  + build.replace(root, "") + 
                    ": Nothing reports waiting.");
                }


                folder.checksum.finalSave();

                //console.log(folder, folder.gcd);
                
                //console.log(folder.scopes);
                //console.log(gcd.log.logs().join('\n')); 
            }
        };
    }


[process]()

This is what happens after all the initiation and parsing of cli options. It
actually initiates the compiling. It receives the parsed arguments. 

    function (args) {
        var Folder = this;
        var builds = args.build;
        var build, folder, gcd, colon, emitname, i, n, j, m;
        var fcd = Folder.fcd;

        var diffsaver = _"diff:f";

        var outsaver = _"stdout:f";

        var stdinf = _":stdin";

        n = builds.length;
        for (i = 0; i < n; i += 1) {
            build = args.build[i];
            folder = new Folder();
            Folder.folders[build] = folder;

            _":assign vars"
    
            _":checksum cache"
            
            _"stdout"

            _"diff"

            _":compile docs"


        }
    }
/
[assign vars]()

    folder.build = build;
    folder.cache = args.cache;
    folder.src = args.src;
    gcd = folder.gcd;
    colon = folder.colon;

[checksum cache]() 

    
    folder.cache = Folder.cache;

    folder.checksum = Object.create(Folder.checksum);
    folder.checksum.data = {};
    folder.checksum.firstLoad(build, args.checksum);
            
[compile docs]()

Need to check for no files and then use standard input. All of this shouldbe
converted to use Folder.fcd.cache....need to implement that in event-when.

    m = args.file.length;
    if (m > 0) {
        for (j = 0; j < m; j += 1) {
            emitname = colon.escape(args.file[j]);
            gcd.emit("initial document:" +  emitname);
        }
    } else {
        fcd.cache("need standard input", "standard input read", stdinf(folder) );
        
    }
 
[stdin]()

This is a function that deals with standard input. It takes in folder in the
loop body and returns a function to be called on return.

    function (folder) {
        var gcd = folder.gcd;
   

        return function (data) {
            var err = data[0];
            var text = data[1];
            if (err) {
                gcd.log("Failure to load standard input or files" + err);
            } else {
               folder.newdoc("standard input", text);
            }
        };
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
            var firstpart = filename.split(sep).slice(0, -1).join(sep);
            var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
            var fpath = folder.build;
            var fullname = fpath + sep + filename; 
            fpath = fpath + (firstpart ? sep + firstpart : "");
            var sha;
            if ( (sha = folder.checksum.tosave(fullname, text) ) ) {
                fs.writeFile(fullname, text, 
                    {encoding:encoding},  function (err) {
                    if (err) {
                        _":mkdirp";
                    } else{
                        folder.log("File " + 
                             "./" + fullname.replace(root, "") +
                            " saved");
                        folder.checksum.data[fullname] = sha; 
                    }
                });
            } else {
                folder.log("File " + "./" + fullname.replace(root, "")  + " unchanged.");
            }
        }],
        ["report error", function (data, evObj) {
            console.log(evObj.ev + (data ? " INFO: " + data : "") );
        }]]
    }

[mkdirp]()

This makes the directory if it does not exist. 

    mkdirp(fpath, function (err) {
        console.log(fpath);
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
            var fcd = folder.Folder.fcd;
            var colon = folder.colon;
            var emitname = evObj.pieces[0];
            var filename = colon.restore(emitname);
            var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
            var fullname = ((typeof src === "string") ? src : folder.src + sep ) +
                 filename;
            fcd.cache(["read file:" + emitname, [fullname, encoding]], 
                "file read:" + emitname, function (data) {
                    var err = data[0];
                    var text = data[1];
                    if (err) {
                        gcd.emit("error:file not read:" + emitname, 
                            [fullname, err] );
                    } else {
                        folder.newdoc(emitname, text);
                    }

            });
     }

     
      
### FCD

This manages the folder communication dispatches. 

    Folder.fcd.on("read file", _":read file");
    Folder.fcd.on("need standard input", _":standard input");
    Folder.fcd.on("exec requested", _":execute command");
    Folder.fcd.on("dir exec requested", _":dir execute");


[read file]() 

    function (data, evObj) {
       var fullname = data[0];
       var encoding = data[1];
       var emitname = evObj.pieces[0];
       var fcd = evObj.emitter;

        fs.readFile( fullname, {encoding:encoding},  function (err, text) {
            fcd.emit("file read:" + emitname, [err, text]);
        });
    }

[standard input]()

Code largely taken from [sindresorhus](https://github.com/sindresorhus/get-stdin/blob/master/index.js) though it is basically also what is in the node docs.  


    function (data, evObj) {
        var fcd = evObj.emitter;

       	var stdin = process.stdin;
      	var ret = '';

    	stdin.setEncoding('utf8');

	    stdin.on('readable', function () {
		    var chunk;


		    while ( (chunk = stdin.read()) ) {
			    ret += chunk;
		    }

	    });

    	stdin.on('end', function () {
	    	fcd.emit("standard input read", [null, ret]);
	    });

        stdin.on('error', function () {
            fcd.emit("standard input read", ["error", ret]);
        });
    }

[execute command]()

This is the cached form of a command line execution with incoming text. 

    function (data, evObj) {
        var fcd = evObj.emitter;
        var emitname = evObj.pieces[0];
        var cmd = data[0];
        var text = data[1];

        try {
            var child = exec(cmd, 
                function (err, stdout, stderr) {
                    fcd.emit("exec finished:" + emitname, [err || stderr, stdout]);
                });
            if (text) {
                child.stdin.write(text);
                child.stdin.end();
            }
        } catch (e) {
            fcd.emit("exec finished:" + emitname, [ e.name + ":" + e.message +"\n"  + cmd + 
             "\n\nACTING ON:\n" + text]);
        }
    }


[dir execute]() 


This is the cached form of a command line execution from a directive. 

    function (cmd, evObj) {
        var fcd = evObj.emitter;
        var fcdname = evObj.pieces[0];


        try {
            var child = exec(cmd, 
                function (err, stdout, stderr) {
                    fcd.emit("dir exec done:" + fcdname, [err || stderr, stdout]);
                });
        } catch (e) {
            fcd.emit("dir exec done:" + fcdname, 
                [ e.name + ":" + e.message +"\n"  + cmd, '' ]);
        }
    }


[download]()
 
      
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
            default : [],
            position : 0,
            list : true,
            help : "files to start with in compiling",
        }, 
        "encoding" : _"encodings:option",
        _":dir",
        _"cache:cli options",
        _"checksum:cli options",
        "lprc": {
            abbr : "l",
            default : root + "lprc.js",
            help : "specify an alternate lprc.js file"
        }, 
        diff : {
            abbr: "d", 
            flag:true,
            help : "include to have diff only output, no saving"
        },
        out : {
            abbr : "o",
            flag : true,
            help : "save no file, piping to standard out instead"
        },
        flag : {
            abbr : "f",
            help : "flags to pass to use in if conditions" 
        }


    }


[dir]()

This sets up the default directories. 

    build : {
        abbr: "b",
        list: true,
        default : [root + "build"],
        help : "Specify the build directory." +
            " Specifying multiple builds do multiple builds." +
            " The build is passed in as a flag per build." 
        

    },
    src : {
        abbr: "s",
        default : root + "src",
        help: "Where to load inernally requested litpro documents from"
    },
    cache : {
        abbr : "c",
        default : root + "cache",
        help: "A place to stored downloaded files for caching"
    }
    

## LPRC

The plugins are managed by a lprc.js which should be located in the directory
that literate programming is invoked from.

The lprc.js file should return a function which is also what plugins should
do. They modify properties on Folder, namely commands, directives, and
actions. Actions are the gcd events that get applied upon folder creation.  

Modifying Folder.postInit allows for a function to process `this` on
instantiation. 


    function (name, args) {
        var Folder = this;

        try {
            require(name)(Folder, args);
        } catch (e) {
            
        }
    }
   

## New Commands

So here we define new commands that only make sense in command line context. 

    Folder.async("exec", _"execute");

    Folder.async("execfresh", _"execute:fresh");

* execute Executes a command line with the input being the std input?

### execute

This executes a command on the command line, using the incoming text as
standard input and taking standard out as what should be passed along. 

This is of the form `|exec commandline and args, second one, ...` 

Since the command line uses the pipe character in the same way litpro does
(well, litpro uses the same pipe...) 

Think using grep (not that you would need that one).

This caches the command, sha1ing the incoming text and arguments; same text, same result is
the idea. 

    function (text, args, callback  ) {
        var doc = this;

        var cmd =  args.join(" | ");


        var shasum = crypto.createHash('sha1');

        shasum.update(text + "\n---\n" + cmd);
        var emitname = shasum.digest('hex');


        doc.parent.Folder.fcd.cache(
            ["exec requested:" + emitname, [cmd, text]],
            "exec finished:" + emitname,
            function (data) {
                var err = data[0];
                var stdout = data[1];

                callback(err, stdout);
            });
    }


[fresh]() 

This does not cache the command. 

    function (text, args, callback  ) {
        var doc = this;

        var cmd =  args.join(" | ");

        try {
            var child = exec(cmd, 
                function (err, stdout, stderr) {
                    callback(err || stderr , stdout);
                });
            if (text) {
                child.stdin.write(text);
                child.stdin.end();
            }
        } catch (e) {
            callback(e.name + ":" + e.message +"\n"  + cmd + 
             "\n\nACTING ON:\n" + text);
        }
    }



## New Directives

* execute which takes in a string as the title and executes, returning the
  output stored in the variable named in the link thext. 
* readfile Read a file and store it. 
* download  Download something and store. Uses the cache
* downsave  Download and then save in a file. Uses the cache. Uses streams to
  do this quickly and efficiently. Think images. 

    Folder.directives.exec = _"dir execute";
    Folder.directives.execfresh = _"dir execute:fresh";
    Folder.directives.readfile = _"dir readfile";
    Folder.directives.download = _"dir download";
    Folder.directives.downsave = _"downsave";



### Dir Execute


This is the directive for executing a command on the command line and storing
it in a variable. There is no piping to standard in. Think ls. 

Not really sure how useful this is. Thought it could be useful for things like
texing a document, but need a way to have directories more accessibe. It might
be that one just does custom executions. But perhaps this serves as a useful
example. 
    
Piping of the standard output internally can be done by use the separator
`!*!`. If you happen to need that, you can overwrite Folder.execseparator.


`[name](# "exec:command line command")`

    function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
        Folder = doc.parent.Folder;
        var command = args.input;
        var separ = Folder.execseparator;
        var ind = command.indexOf(separ);
        var pipes = '';
        if (ind !== -1) {
            pipes = command.slice(ind + separ.length);
            command = command.slice(0,ind);
        }

        var name = colon.escape(args.link);
        var emitname = "exec:"+name;
        var f;


        var fcdname = colon.escape(command); 

        var fcd = Folder.fcd;

        fcd.cache(["dir exec requested:" + fcdname, command],
            "dir exec done:" + fcdname, 
            function (data)  {
                var err = data[0];
                var stdout = data[1];
                if (err) {
                   gcd.emit("error:execute", [command, err]); 
                } else {
                    if (stdout) {
                        _":dealing with stdout"
                    }
                }
            }
        );
    }


        
[fresh]() 

This is the version that is not cached. 


`[name](# "execfresh:command line command")`


    function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
        Folder = doc.parent.Folder;
        var command = args.input;
        var separ = Folder.execseparator;
        var ind = command.indexOf(separ);
        var pipes = '';
        if (ind !== -1) {
            pipes = command.slice(ind + separ.length);
            command = command.slice(0,ind);
        }

        var name = colon.escape(args.link);
        var emitname = "execfresh:"+name;
        var f;


        exec(command, function (err, stdout, stderr) {
            if (err) {
               gcd.emit("error:execute", [command, err, stderr]); 
            } else {
                if (stdout) {
                    _":dealing with stdout"
                }
                if (stderr) {
                    gcd.emit("error:execute output", [command, stderr]);
                }
            }
        });
    }

[dealing with stdout]()

So we want to deal with piping if we a value and if we have pipes. 

    if (pipes) {
        pipes += '"';
        f = function (data) {
            if (name) {
                doc.store(name, data);
            }
        };
        gcd.once("text ready:" + emitname, f);
        doc.pipeParsing(pipes, 0, '"', emitname, args.cur);
        gcd.emit("text ready:" + emitname + colon.v + "0", stdout);
    } else {
        if (name) {
            doc.store(name, stdout);
        }
    }


### Dir Readfile


This is the directive for reading a file and storing its text.  

`[var name](url "readfile:encoding|commands")`
   

    function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
        var name = colon.escape(args.link);
        var filename = args.href; 
        var emitname = colon.escape(filename);
        var cut = args.input.indexOf("|");
        var encoding = args.input.slice(0,cut);
        var pipes = args.input.slice(cut+1);
        var f;


        encoding = encoding.trim() || doc.parent.encoding || "utf8";

   
        doc.parent.Folder.fcd.cache(
            ["read file:" + emitname, [filename, encoding]],
            "file read:" + emitname,
            function (data) {
                var err = data[0];
                var text = data[1];
                if (err) {
                   gcd.emit("error:readfile", [filename, name, err]); 
                } else {
                    _":deal with pipes" 
                }
            }
        );
    }

[deal with pipes]()

Really need to abstract common behavior. 

    if (pipes) {
        pipes += '"';
        f = function (data) {
            if (name) {
                doc.store(name, data);
            }
        };
        gcd.once("text ready:" + emitname, f);
        doc.pipeParsing(pipes, 0, '"', emitname, args.cur);
        gcd.emit("text ready:" + emitname + colon.v + "0", text);
    } else {
        if (name) {
            doc.store(name, text);
        }
    }


### Dir Download


This is the directive for downloading a file and storing its text in a
variable for access. Note the encoding is for saving and writing locally; the
encoding from the server is whatever it is. 


`[var name](url "download:encoding")`


    function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.colon.escape(args.link);
        var url = args.href;
        var encoding = args.input || doc.parent.encoding;
        var cache = doc.parent.cache;
       
        if (cache.has(url) ) {
            _":load cache"
        } else {
            if (cache.waiting(url) ) {
                _":waiting for download"
            } else {
                _":do the download"
            }
        }
    }


[load cache]()

The file is cached, we load it. 

    cache.load(url, encoding, function (err, value) {
        if (err) {
           gcd.emit("error:http request:cache error", [url, name, err]); 
        } else {
            doc.store(name, value);
        }
    });


[waiting for download]()

Here we are waiting for someone else to download the file.

    gcd.on("cache url downloaded:" + doc.colon.escape(url),
        function (data) {
            doc.store(name, data);
    });

[do the download]()

We use the needle library to do the download. If all goes well, we store the
file, store the variable, and emit the answer. 

    needle.get(url, {compressed : true}, function (err, response) {
        var text;
        if (err) {
            gcd.emit("error:http request:failed", [err, url, name]);
        } else {
            if (response.statusCode === 200) {
                text = response.body;
                cache.save(url, encoding, text);
                doc.store(name, text);
                gcd.emit("cache url downloaded:" + doc.colon.escape(url), 
                    text);
            } else {
                gcd.emit("error:http request:bad status", [url, name,
                    response]);
            }
        }

    });



### Downsave


This is the directive for downloading and saving a file directly. Think
pictures or bootstrap support files. Stuff not being acted on. This stuff
should be streamed to their destinations, whether to/from the cache or not. 

If there is a zipurl, then if the url is not cached, then the zipurl is
downloaded (after checking the cache) instead and unzipped with the filename 

Using jszip, we can just leave the zip file in the cache and extract the files
as needed easily enough. 

We should also record its saving just like any other file saving in the
destination so that we don't rewrite unnecessarily. 

`[out filename](url "downsave: zipurl")`


    function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.colon.escape(args.link);
        var url = args.href;
        var zipurl = args.title;
        var cache = doc.parent.Folder.cache;
       
        if (cache.has(url) ) {
            cache.load(url, function (err, value) {
                if (err) {
                   gcd.emit("error:http request:cache error", [url, name, err]); 
                } else {
                    doc.store(name, value);
                }
            });
        } else {
            if (true ) {
            needle.get(url, {compressed : true}, function (err, response) {
                if (err) {
                    gcd.emit("error:http request:failed", [err, url, name]);
                } else {
                    if (response.statusCode === 200) {
                        doc.store(name, response.body);
                        cache.save(url, response.body);
                    } else {
                        gcd.emit("error:http request:bad status", [url, name,
                            response]);
                    }
                }

            });
            }
        }
    }



## Cache

This implements the cache object to save on downloads. In particular, the idea
is that we should save downloads by caching locally in the cache directory. We
need the following methods:

* has  Whether the url has been cached
* save This stores the downloaded file and records it in the cache
* load This loads the cache object from the directory. 
* firstLoad  Synchronous loading of the cache file.
* finalSave Synchronos saving of the cache object upon exit. 

The cache directory should be excluded from npm and git. 

    { has : _":has",
        save : _":save",
        load : _":load",
        firstLoad : _":first load",
        finalSave : _":final save",
        dir : '',
        filename : '',
        data : {} 
    }

[first load]()

This tries to read in the file. 

    function (dir, file) {
        var filename = dir + sep + file;
        var json, self = this;
        self.dir = dir;
        self.filename = filename;


        try { 
            mkdirp.sync(dir);
            json = fs.readFileSync(filename, {encoding:"utf8"});
            self.data = JSON.parse(json);
            self.filename = filename;
        } catch (e) {
            self.data = {};
        }
    }

[has]()

    function (name) {
        return this.data.hasOwnProperty(name);
    }

[save]()

We will save the files using their checksum as the name and using the cache
file as the record associating with the url. Seems safest. 

    function (url, encoding, text) {
        var self = this;
        var name = checksum.sha1sync(text); 
        fs.writeFile(name, text, {encoding:encoding}, function (err) {
            if (err) {
                console.log("error:cache saving error", [url, name, text]);
            } else {
                self.data[url] = name;
            }
        });
    }

 
[load]()

The object exists in the cache. Let's load it.

    function (url, encoding, callback) {
        var self = this;

        fs.readFile(self.data[url], {encoding:encoding}, callback);

    }

[final save]()

Wrtite out the 

    function () {
        var self = this;
            
        try {
            fs.writeFileSync(self.filename, JSON.stringify(self.data));
        } catch (e) {
            console.log("error:cache file not savable", [e.message, self.filename]);
        }
    }

[cli options]()

This is the object that handles the argument parsing options.

    cachefile : {
        default : ".cache",
        help : "List of files already downloaded. Stored in cache directory"
    }


## Checksum

This holds the checksums of 

    {
        firstLoad : _"cache:first load",
        finalSave : _"cache:final save",
        sha1sync : _":sha1 sync",
        tosave: _":to save",
        filename : '',
        dir : '',
        data : {} 
    }


[cli options]()

This is the object that handles the argument parsing options.

    checksum : {
        default : ".checksum",
        help: "A list of the files and their sha1 sums to avoid rewriting." +
            "Stored in build directory"
    }

[to save]()

Does it need saving?

    function (name, text) {
        var self = this;
        var data = self.data;

        var sha = self.sha1sync(text);

        if ( data.hasOwnProperty(name) &&
             (data[name] === sha) ) {
            return false; 
        } else {
            return sha;
        }
    }


[sha1 sync]()

    function (text) {
        var shasum = crypto.createHash('sha1');

        shasum.update(text);
        return shasum.digest('hex');
    }


[sha1 async]()


    var s = fs.ReadStream(filename);
    s.on('data', function(d) {
      shasum.update(d);
    });

    s.on('end', function() {
      var d = shasum.digest('hex');
      console.log(d + '  ' + filename);
    });

### Stdout

We also allow for standard output to be the result if that option is selected. 

All we need to do is replace the saving function with one that logs it to the
console. 

    if (args.out) {
       gcd.action("save file", outsaver); 
    }


[f]()

This simply logs the file. 


    function(text, evObj) {
        var gcd = evObj.emitter;
        var folder = gcd.parent;
        var colon = folder.colon;
        var emitname = evObj.pieces[0];
        var filename = colon.restore(emitname);
        var firstpart = filename.split(sep).slice(0, -1).join(sep);
        var fpath = folder.build;
        var fullname = fpath + sep + filename; 
        fpath = fpath + (firstpart ? sep + firstpart : "");
        
        folder.log("FILE: " + fullname + ":\n\n" + text +
                    "\n----\n");
    }


## Diff

This deals with the diffing. Instead of saving, we check to see if there are
differences and then report the differences. 

First we need to install it. 

    if (args.diff) {
        gcd.action("save file", diffsaver);
    }
 
[f]()
        
    function(text, evObj) {
        var gcd = evObj.emitter;
        var folder = gcd.parent;
        var colon = folder.colon;
        var emitname = evObj.pieces[0];
        var filename = colon.restore(emitname);
        var firstpart = filename.split(sep).slice(0, -1).join(sep);
        var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
        var fpath = folder.build;
        var fullname = fpath + sep + filename; 
        fpath = fpath + (firstpart ? sep + firstpart : "");
        if (folder.checksum.tosave(fullname, text) ) {
            if (folder.checksum.data.hasOwnProperty(fullname) ) {
                _":diff it"
            } else {
                folder.log("New file " + fullname + ":\n\n" + text +
                    "\n----\n");
            }
        } else {
            folder.log("File " + fullname + " unchanged.");
        }
    }

[diff it]()

    fs.readFile(fullname, {encoding:encoding}, function (err, oldtext) {
        var result, ret; 
        if (err) {
            folder.log("Could not read old file" + fullname + 
                " despite it being in the checksum file." );
        } else {
            ret = '';
            result = diff.diffLines(oldtext, text);
            result.forEach(function (part) {
                if (part.added) {
                    ret += colors.green(part.value);
                } else if (part.removed) {
                    ret += colors.red(part.value);
                }
            });
            //folder.log("Diff on " + fullname +":\n\n" + ret+ "\n----\n" );
            
            folder.log(diff.createPatch(fullname, oldtext, text, "old", "new"));
        }
    });


## README


literate-programming-cli   
 ====================

This is the command line client for literate-programming. 

Install using `npm install literate-programming-cli`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 

If you want a global install so that you just need to write `litpro` then use
`npm install -g literate-programming-cli`. 

 ## Flags

The various flags are

* -e, --encoding Specify the default encoding. It defaults to utf8, but any
  encoding supported by iconv-lite works. To override that behavior per loaded
  file from a document, one can put the encoding between the colon and pipe in
  the directive title. This applies to both reading and writing. 
* -f, --file A specified file to process. It is possible to have multiple
  files, each proceeded by an option. Also any unclaimed arguments will be
  assumed to be a file that gets added to the list. 
* -l, --lprc This specifies the lprc.js file to use. None need not be
  provided. The lprc file should export a function that takes in as arguments
  the Folder constructor and an args object (what is processed from the
  command line). This allows for quite a bit of sculpting. See more in lprc. 
* -b, --build  The build directory. Defaults to build. Will create it if it
  does not exist. Specifying . will use the current directory. 
* -s, --src  The source directory to look for files from load directives. The
  files specified on the command line are used as is while those loaded from
  those files are prefixed. Shell tab completion is a reaoson for this
  difference. 
* -c, --cache The cache is a place for assets downloaded from the web.
* --cachefile This gives an alternate name for the cache file that registers
  what is downloaded. Default is `.cache`
* -d, --diff This computes the difference between each files from their
  existing versions. There is no saving of files. 

    



 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)



## TODO

preview, diff command mode


readfile, directory, writefile commands for use from a litpro doc.

maybe a built in watcher program, using nodemon?  
command line: read file, readdir, write file, file encodings, curling, 

plugins: version--npm stuff, jshint, jstidy, jade, markdown,

development versus deployment? Maybe manage it with different lprc files. So
default is development, but then one production ready, switch to lprc-prod.js
which could send to a different build directory. Also minify commands, etc.,
could be available in both, but changed so that in development they are a
passthru noop. 

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
        "checksum": "^0.1.1",
        "colors": "^1.0.3",
        "diff": "^1.2.2",
        "iconv-lite": "^0.4.7",
        "literate-programming-lib": "^1.5.1",
        "mkdirp": "^0.5.0",
        "needle": "^0.7.11",
        "nomnom": "^1.8.1"
      },
      "devDependencies" : {
        "event-when": "^1.0.0",
        "tape": "^3.5.0"        
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
    cache

## npmignore


    build
    .checksum
    cache
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

