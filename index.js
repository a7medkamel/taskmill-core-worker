var s_hrtime    = process.hrtime()
  , Worker      = require('./lib/worker')
  ;

process.on('uncaughtException', function (err) {
  console.error(new Date().toUTCString(), 'uncaughtException', err.message);
  console.error(err.stack);

  process.exit(1);
});

console.log('>> started');

(new Worker()).listen(undefined, function(err, res){
  if (err) {
    throw err;
  }
  
  var diff = process.hrtime(s_hrtime);
  console.log('>> code loaded,', ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2) + 'ms');
});
