#!/usr/bin/env node

/*global process, require, console*/

var mod = require('./index.js');

var args = mod.opts.parse();

//console.log(args);

var Folder = mod.Folder;

Folder.lprc(args.lprc, args);

Folder.cache.firstLoad(args.cache, args.cachefile);

var folder = new Folder();

folder.Folder = Folder;

folder.checksum = Object.create(Folder.checksum);
folder.checksum.data = {};

folder.checksum.firstLoad(args.build, args.checksum);

folder.process(args);

process.on('exit', function () {
    folder.exit();
});