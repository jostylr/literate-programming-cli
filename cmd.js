var exec = require('child_process').exec,
    child;

child = exec('grep watch ',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

child.stdin.write("this is a watcher.\nWe have two watchers\nBlank\nBlank");
child.stdin.write("watcher just\nnone\ndude\ntrailing watcher");
child.stdin.end();
