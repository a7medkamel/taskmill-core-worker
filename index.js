var argv  = require('minimist')(process.argv.slice(2))
  , Agent = require('./lib/agent')
  , port  = argv.port || 80
  ;

process.on('uncaughtException', function (err) {
  console.error('taskmill-core-agent::uncaughtException', err.stack || err.toString());
});

function main(options) {
  options = options || {};

  (new Agent()).listen({ port : options.port || port })
}

if (require.main === module) {
  main();
}

module.exports = {
    main    : main
  , request : require('./lib/request')
};