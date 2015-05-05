var argv  = require('minimist')(process.argv.slice(2))
  , Agent = require('./lib/agent')
  , agent = new Agent()
  , port  = argv.port || 80
  ;

process.on('uncaughtException', function (err) {
  console.error('sdk::uncaughtException', err.stack || err.toString());
});

function main(options) {
  agent.listen({ port : options.port })
}

if (require.main === module) {
  main({
      port  : port
  });
}

module.exports = {
  main : main
};