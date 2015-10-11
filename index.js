var Worker  = require('./lib/worker')
  , App     = require('./lib/app')
  , _       = require('underscore')
  , Promise = require('bluebird')
  , config  = require('config')
  ;

if (config.longstack) {
  Promise.longStackTraces();
}

process.on('uncaughtException', function (err) {
  console.error('taskmill-core-worker::uncaughtException', err.stack || err.toString());
});

if (require.main === module) {
  (new Worker({})).listen({ port : config.port || 80 });
}

module.exports = {
    Worker  : Worker
  , App     : App
  , error   : require('./lib/error')
  , request : require('./lib/request')
};