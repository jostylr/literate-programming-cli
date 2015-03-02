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

var root = process.cwd();

var loader =  function (data, evObj, src) {
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
 ;

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
                        folder.log("File " + fullname + " saved");
                        folder.checksum[fullname] = sha; 
                    }
                });
            } else {
                folder.log("File " + fullname + " unchanged.");
            }
        }],
        ["report error", function (data, evObj) {
            console.log(evObj.ev + (data ? " INFO: " + data : "") );
        }]]
    };

Folder.directives.execute = function (args) {
    var doc = this;
    var gcd = doc.gcd;
    var command = args.input;
    var name = doc.colon.escape(args.link);

    exec(command, function (err, stdout, stderr) {
        if (err) {
           gcd.emit("error:execute", [command, err, stderr]); 
        } else {
            doc.store(name, stdout);
            if (stderr) {
                gcd.emit("error:execute output", [command, stderr]);
            }
        }
    });
};
Folder.directives.readfile = function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.colon.escape(args.link);
        var filename = args.href; 
        var cut = args.input.indexOf("|");
        var encoding = args.input.slice(0,cut);
        var pipes = args.input.slice(cut+1);
    
        encoding = encoding || doc.parent.encoding || "utf8";
    
        fs.readFile(filename, {encoding:encoding}, function (err, value) {
            if (err) {
               gcd.emit("error:readfile", [filename, name, err]); 
            } else {
                doc.store(name, value);
            }
        });
    };
Folder.directives.download = function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.colon.escape(args.link);
        var url = args.href;
        var encoding = args.input || doc.parent.encoding;
        var cache = doc.parent.Folder.cache;
       
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

Folder.prototype.encoding = "utf8";

Folder.prototype.exit = function () {
        var folder = this;
        var arr = folder.reportwaits();
        if ( arr.length) {
            console.log(arr.join("\n"));
        } else {
            console.log("Nothing reports waiting.");
        }
    
        Folder.cache.finalSave();
    
        folder.checksum.finalSave();
    
        //console.log(folder, folder.gcd);
        
        //console.log(folder.scopes);
        //console.log(gcd.log.logs().join('\n')); 
    };

Folder.prototype.process = function (args) {
        var folder = this;
        var gcd = folder.gcd;
        var colon = folder.colon;
        var emitname;
    
        folder.build = args.build;
        folder.cache = args.cache;
        folder.src = args.src;
    
        if (args.diff) {
            gcd.action("save file", function(text, evObj) {
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
                });
        }
    
        var i, n = args.file.length;
        for (i = 0; i < n; i += 1) {
            emitname = colon.escape(args.file[i]);
            gcd.emit("initial document:" +  emitname);
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

var iconv = require('iconv-lite'); 
iconv.extendNodeEncodings();


var opts = require("nomnom").
    options({
            "file": {
                abbr : "f",
                default : [],
                position : 0,
                list : true,
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
                default : root + sep + "build"
            },
            src : {
                abbr: "s",
                default : root + sep + "src"
            },
            cache : {
                abbr : "c",
                default : root + sep + "cache"
            },
            cachefile : {
                default : ".cache"
            },
            checksum : {
                default : ".checksum"
            },
            "lprc": {
                abbr : "l",
                default : root + sep + "lprc.js",
            }, 
            diff : {
                abbr: "d", 
                flag:true
            }
        
        }).
    script("litpro");

Folder.lprc = function (name, args) {
        var Folder = this;
    
        try {
            require(name)(Folder, args);
        } catch (e) {
            
        }
    }
      ;

module.exports.Folder = Folder;
module.exports.opts = opts;