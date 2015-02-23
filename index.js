#!/usr/bin/env node

/*global process, require, console*/
/*jslint evil:true*/

var fs = require('fs');
var Folder = require('literate-programming-lib');

Folder.actions = {"on" : [
    ["need document", "read file"],
    ["file ready", "save file"] ],
 "action" : [
    ["read file", function (data, evObj) {
        var gcd = evObj.emitter;
        var folder = gcd.parent;
        var colon = folder.colon;
        var emitname = evObj.pieces[0];
        var filename = colon.restore(emitname);
        console.log(filename, emitname);
        var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
        fs.readFile(filename, {encoding:encoding},  function (err, text) {
            if (err) {
                gcd.emit("error:file not found:" + emitname);
            } else{
                folder.newdoc(emitname, text);
            }
        });
    }], 
    ["save file",  function(text, evObj) {
        var gcd = evObj.emitter;
        var folder = gcd.parent;
        var colon = folder.colon;
        var emitname = evObj.pieces[0];
        var filename = colon.restore(emitname);
        var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
        fs.writeFile(filename, text, {encoding:encoding},  function (err) {
            if (err) {
                gcd.emit("error:file not saveable:" + emitname);
            } else{
                console.log("File " + filename + " saved");
            }
        });
    }]]
}
 ;

Folder.prototype.encoding = "utf8";

Folder.prototype.exit = function () {
        var folder = this;
        var arr = folder.reportwaits();
        if ( arr.length) {
            console.log(arr.join("\n"));
        } else {
            console.log("It looks good!");
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
    
        var i, n = args.file.length;
        for (i = 0; i < n; i += 1) {
            emitname = colon.escape(args.file[i]);
            gcd.emit("need document:" +  emitname);
        }
    
    };

var iconv = require('iconv-lite'); 
iconv.extendNodeEncodings();


var opts = require("nomnom").
    options({
            "file": {
                abbr : "f",
                "default" : [],
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
                }
        }).
    script("litpro");

try {
    require('./lprc.js')(Folder);
} catch (e) {
    console.log(e);
}
  

var args = opts.parse(); 

var folder = new Folder();

folder.process(args);

process.on('exit', function () {
    folder.exit();
});