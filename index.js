var s_hrtime    = process.hrtime()
  , Worker      = require('./lib/worker')
  , App         = require('./lib/app')
  , Promise     = require('bluebird')
  , config      = require('config')
  ;

if (config.longstack) {
  Promise.longStackTraces();
}

process.on('uncaughtException', function (err) {
  console.error('taskmill-core-worker::uncaughtException', err.stack || err.toString());
});

function main() {
  function Code(worker, data) {
    this.manual = data.manual;
  };

  Code.prototype.run = function(req, res, next) {
    console.log('foo bar')
    res.send('Hello from taskmill-core-worker!');
  };

  (new Worker({ Code : Code })).listen(undefined, function(err, res){
    var diff = process.hrtime(s_hrtime);
    console.log('worker ready in', (diff[0] * 1e9 + diff[1]) / 1e6);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
    Worker  : Worker
  , App     : App
  , request : require('./lib/request')
};