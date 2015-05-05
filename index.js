var argv  = require('minimist')(process.argv.slice(2))
  , Agent = require('./lib/agent')
  , port  = argv.port || 80
  ;

process.on('uncaughtException', function (err) {
  console.error('sdk::uncaughtException', err.stack || err.toString());
});

function main(options) {
  (new Agent()).listen({ port : options.port })
}

if (require.main === module) {
  main({
      port  : port
  });
}

module.exports = {
    main    : main
  , request : require('./lib/request')
};