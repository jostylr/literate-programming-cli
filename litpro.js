#!/usr/bin/env node

/*global process, require */

var mod = require('./index.js');

var args = mod.opts.parse();

args.other.forEach(function (arg) {
    var pair = arg.split(":");
    if (pair.length === 1) {
        args[pair[0]] = true;
    } else if (pair.length === 2) {
        args[pair[0]] = pair[1]; 
    } else {
        args[pair[0]] = pair.slice(0);
    }
});

//console.log(args);

var Folder = mod.Folder;

Folder.prototype.encoding = args.encoding;

Folder.lprc(args.lprc, args);

Folder.process(args);

process.on('exit', Folder.exit());
