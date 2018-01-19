const amp = require('app-module-path');

// do this once
amp.addPath(`/mnt/src/node_modules`);

console.log('> started');

process.on('uncaughtException', function (err) {
  console.error(new Date().toUTCString(), 'uncaughtException', err.message);
  console.error(err.stack);

  process.exit(1);
});

require('./lib/index');
