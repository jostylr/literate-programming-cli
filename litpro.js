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