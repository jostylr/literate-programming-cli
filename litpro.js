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