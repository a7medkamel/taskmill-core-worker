var Worker = require('./lib/worker');

process.on('uncaughtException', function (err) {
  console.error(new Date().toUTCString(), 'uncaughtException', err.message);
  console.error(err.stack);

  process.exit(1);
});

console.log('> started');

(new Worker()).listen(undefined, function(err, res){
  if (err) {
    throw err;
  }
});