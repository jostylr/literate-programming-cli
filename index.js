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

var loader =  function (data, evObj, src) {
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
 };

Folder.actions = {"on" : [
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
                    });
                } else{
                    folder.log("SAVED: " + 
                         "./" + fullname.replace(root, "").
                            replace(/^\.\//, '' ) );
                    folder.checksum.data[fullname] = sha; 
                }
            });
        } else {
            folder.log("UNCHANGED " + "./" + fullname.replace(root, ""). 
                            replace(/^\.\//, '' ) );
        }
    }],
    ["report error", function (data, evObj) {
        console.log(evObj.ev + (data ? " INFO: " + data : "") );
    }] ]
};

Folder.directives.exec = function (args) {
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
                }
            }
        }
    );
};
Folder.directives.execfresh = function (args) {
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
            }
            if (stderr) {
                gcd.emit("error:execute output", [command, stderr]);
            }
        }
    });
};
Folder.directives.readfile = function (args) {
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
            }
        }
    );
};
Folder.directives.download = function (args) {
    var doc = this;
    var gcd = doc.gcd;
    var name = doc.colon.escape(args.link);
    var url = args.href;
    var encoding = args.input || doc.parent.encoding;
    var cache = doc.parent.cache;
   
    if (cache.has(url) ) {
        cache.load(url, encoding, function (err, value) {
            if (err) {
               gcd.emit("error:http request:cache error", [url, name, err]); 
            } else {
                doc.store(name, value);
            }
        });
    } else {
        if (cache.waiting(url) ) {
            gcd.on("cache url downloaded:" + doc.colon.escape(url),
                function (data) {
                    doc.store(name, data);
            });
        } else {
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
        }
    }
};
Folder.directives.downsave = function (args) {
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
};

Folder.async("exec", function (text, args, callback  ) {
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
});

Folder.async("execfresh", function (text, args, callback  ) {
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
});

Folder.prototype.encoding = "utf8";

Folder.exit = function () {
    var Folder  = this; 

     return function () {
        var build, folder, arr;
        var folders = Folder.folders; 
            
        Folder.cache.finalSave();

        for ( build in folders) {
            folder = folders[build];
            arr = folder.reportwaits();
       
            if ( arr.length) {
                console.log( "STILL WAITING: ./" + build.replace(root, "").
                    replace(/\.$/, '') +
                "\n---\n" + arr.join("\n") + "\n\n");
            } else {
                console.log( "DONE: ./"  + build.replace(root, "").  
                    replace(/\.$/, '') );
            }


            folder.checksum.finalSave();

            //console.log(folder, folder.gcd);
            
            //console.log(folder.scopes);
            //console.log(gcd.log.logs().join('\n')); 
        }
    };
};

Folder.process = function (args) {
    var Folder = this;
    var builds = args.build;
    var build, folder, gcd, colon, emitname, i, n, j, m, k, o;
    var fcd = Folder.fcd;

    var diffsaver = function(text, evObj) {
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
            } else {
                folder.log("New file " + fullname + ":\n\n" + text +
                    "\n----\n");
            }
        } else {
            folder.log("File " + fullname + " unchanged.");
        }
    };

    var outsaver = function(text, evObj) {
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
    };

    var stdinf = function (folder) {
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
    };

    n = builds.length;
    for (i = 0; i < n; i += 1) {
        build = args.build[i];
        folder = new Folder();
        Folder.folders[build] = folder;

        folder.build = build;
        folder.cache = args.cache;
        folder.src = args.src;
        gcd = folder.gcd;
        colon = folder.colon;
        folder.flags[build] = true;
        o = args.flag.length;
        for (k = 0; k < o; k+=1) {
            folder.flags[args.flag[k]] = true;
        }

        folder.cache = Folder.cache;
        
        folder.checksum = Object.create(Folder.checksum);
        folder.checksum.data = {};
        folder.checksum.firstLoad(build, args.checksum);
        
        if (args.out) {
           gcd.action("save file", outsaver); 
        }

        if (args.diff) {
            gcd.action("save file", diffsaver);
        }

        m = args.file.length;
        if (m > 0) {
            for (j = 0; j < m; j += 1) {
                emitname = colon.escape(args.file[j]);
                gcd.emit("initial document:" +  emitname);
            }
        } else {
            fcd.cache("need standard input", "standard input read", stdinf(folder) );
            
        }


    }
};

Folder.cache = { has : function (name) {
    return this.data.hasOwnProperty(name);
},
    save : function (url, encoding, text) {
        var self = this;
        var name = checksum.sha1sync(text); 
        fs.writeFile(name, text, {encoding:encoding}, function (err) {
            if (err) {
                console.log("error:cache saving error", [url, name, text]);
            } else {
                self.data[url] = name;
            }
        });
    },
    load : function (url, encoding, callback) {
        var self = this;
    
        fs.readFile(self.data[url], {encoding:encoding}, callback);
    
    },
    firstLoad : function (dir, file) {
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
    },
    finalSave : function () {
        var self = this;
            
        try {
            fs.writeFileSync(self.filename, JSON.stringify(self.data));
        } catch (e) {
            console.log("error:cache file not savable", [e.message, self.filename]);
        }
    },
    dir : '',
    filename : '',
    data : {} 
};

var checksum = Folder.checksum = {
    firstLoad : function (dir, file) {
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
    },
    finalSave : function () {
        var self = this;
            
        try {
            fs.writeFileSync(self.filename, JSON.stringify(self.data));
        } catch (e) {
            console.log("error:cache file not savable", [e.message, self.filename]);
        }
    },
    sha1sync : function (text) {
        var shasum = crypto.createHash('sha1');
    
        shasum.update(text);
        return shasum.digest('hex');
    },
    tosave: function (name, text) {
        var self = this;
        var data = self.data;
    
        var sha = self.sha1sync(text);
    
        if ( data.hasOwnProperty(name) &&
             (data[name] === sha) ) {
            return false; 
        } else {
            return sha;
        }
    },
    filename : '',
    dir : '',
    data : {} 
};

Folder.folders = {};

Folder.execseparator = "!*!";

Folder.fcd.on("read file", function (data, evObj) {
   var fullname = data[0];
   var encoding = data[1];
   var emitname = evObj.pieces[0];
   var fcd = evObj.emitter;

    fs.readFile( fullname, {encoding:encoding},  function (err, text) {
        fcd.emit("file read:" + emitname, [err, text]);
    });
});
Folder.fcd.on("need standard input", function (data, evObj) {
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
});
Folder.fcd.on("exec requested", function (data, evObj) {
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
});
Folder.fcd.on("dir exec requested", function (cmd, evObj) {
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
});

var iconv = require('iconv-lite'); 
iconv.extendNodeEncodings();

var opts = require("nomnom").
    options({
        "file": {
            default : [],
            position : 0,
            list : true,
            help : "files to start with in compiling",
        }, 
        "encoding" : { 
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
        },
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
        },
        cachefile : {
            default : ".cache",
            help : "List of files already downloaded. Stored in cache directory"
        },
        checksum : {
            default : ".checksum",
            help: "A list of the files and their sha1 sums to avoid rewriting." +
                "Stored in build directory"
        },
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
            help : "flags to pass to use in if conditions",
            default : []
        }
    
    
    }).
    script("litpro");

Folder.lprc = function (name, args) {
    var Folder = this;

    try {
        require(name)(Folder, args);
    } catch (e) {
        
    }
};

module.exports.Folder = Folder;
module.exports.opts = opts;

module.exports.tests = function (litpro) {
    litpro = litpro || 'node ../../node_modules/.bin/litpro';
    
    var read = fs.readFileSync;
    var write = fs.writeFileSync;
    var resolve = require('path').resolve;
    var exec = require('child_process').exec;
    var del = require('del');
    var isUtf8 = require('is-utf8');
    var tape = require('tape');


    var equals = function (a, b) {
        if (typeof a.equals === 'function') {
            return a.equals(b);
        }
        var i, n = a.length;
        if (n !== b.length) {
            return false;
        }
        
        for (i = 0; i < n; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        
        return true;
    };
    var readdir = function self (root, files, prefix) {
        prefix = prefix || '';
        files = files || [];
    
        var dir = path.join(root, prefix);
        if (!fs.existsSync(dir)) {
            return;
        }
        if (fs.statSync(dir).isDirectory()) {
            fs.readdirSync(dir).
            forEach(function (name) {
                self(root, files, path.join(prefix, name));
            });
        } else {
            files.push(prefix);
        }
    
        return files;
        };
    var checkdir = function (dir) {
        var ret = [];
        var count = 0;
        var actuals = readdir( resolve("tests", dir, "canonical") );
        actuals.forEach(function(rel){
            count += 1;
            var a = read(resolve("tests", dir, "canonical", rel));
            var e = read(resolve("tests", dir, rel));
            if (!(equals(a, e))) {
                if (isUtf8(a) && isUtf8(e) ) {
                    ret.push(rel + "\n~~~\n" + a.toString() + "\n~~~\n" + 
                        e.toString() + "\n---\n\n");
                } else {
                    ret.push(rel);
                }
            }
        });
        return [count, ret];
    };
    var test = function (tape, dir, command) {
        command = command || '' ;
        var reset;
    
        tape(dir, function (t) {
            t.plan(1);
    
            try {
                reset = read("reset.test");
                reset = JSON.parse(reset);
                del.sync(reset);
            } catch (e) {
                reset = ["build", "cache", "out.test", "err.test"];
            }
    
    
            var cmd = "cd tests/"+ dir + "; " + litpro + " " + command;
    
    
            exec(cmd, function (err, stdout, stderr)  {
                if (err) {
                    console.log(err);
                }
                write(resolve("tests", dir, "out.test"), stdout );
                write(resolve("tests", dir, "err.test"), stderr);
                var results = checkdir(dir);
                var bad = results[1];
                var msg = "CHECKED: " + results[0];
                if (bad.length > 0) {
                    t.fail(msg + "\n" + "BAD: " + bad.length  );
                    console.log("not equal:\n" + bad.join("\n"));
                } else {
                    t.pass(msg);
                }
            });
        });
    
    };

    return function () {
        var i, n = arguments.length;

        for (i = 0; i < n; i += 1) {
            test(tape, arguments[i][0], arguments[i][1]);               
        }

    };

};
