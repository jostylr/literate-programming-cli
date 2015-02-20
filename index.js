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