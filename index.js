/*global process, require, console, module*/

var fs = require('fs');
var path = require('path');
var sep = path.sep;
var Folder = require('literate-programming-lib');
var mkdirp = require('mkdirp');

var root = process.cwd();
var build, src, cache;

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
            var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
            var fpath = folder.build;
            var fullname = fpath + sep + filename;
            fs.writeFile(fullname, text, 
                {encoding:encoding},  function (err) {
                if (err) {
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
                    });
                } else{
                    console.log("File " + fullname + " saved");
                }
            });
        }],
        ["report error", function (data, evObj) {
            console.log(evObj.ev + (data ? " INFO: " + data : "") );
        }]]
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
    
        var i, n = args.file.length;
        for (i = 0; i < n; i += 1) {
            emitname = colon.escape(args.file[i]);
            gcd.emit("initial document:" +  emitname);
        }
    
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
            "lprc": {
                abbr : "l",
                default : root + sep + "lprc.js",
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