var argv    = require('minimist')(process.argv.slice(2))
  , Worker  = require('./lib/worker')
  , port    = argv.port || 80
  ;

process.on('uncaughtException', function (err) {
  console.error('taskmill-core-worker::uncaughtException', err.stack || err.toString());
});

function main(options) {
  options = options || {};

  (new Worker()).listen({ port : options.port || port })
}

if (require.main === module) {
  main();
}

module.exports = {
    main    : main
  , request : require('./lib/request')
};