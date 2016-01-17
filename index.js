var s_hrtime    = process.hrtime()
  , Worker      = require('./lib/worker')
  , Promise     = require('bluebird')
  ;

// use BLUEBIRD_DEBUG=1 on worker boot instead
// Promise.longStackTraces();

console.log('>> started');

(new Worker()).listen(undefined, function(err, res){
  var diff = process.hrtime(s_hrtime);
  console.log('>> code loaded,', ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2) + 'ms');
});
