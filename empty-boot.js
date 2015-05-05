// var rest  = require('./rest')
//   , argv  = require('minimist')(process.argv.slice(2))
//   ;

process.on('uncaughtException', function (err) {
  console.error('sdk::uncaughtException', err.stack || err.toString());
});

// var vm                = require('vm')
  // , _                 = require('underscore')
  // , domain            = require('domain')
  // // , mock_fs   = require('mock-fs')
  // , fs                = require('fs')
  // , Promise           = require('bluebird')
  // , util              = require('util')
  // , doctrine          = require('doctrine')
  // , babel             = require('babel-core')
  // , safe_parse        = require('safe-json-parse/tuple')
  // , App               = require('./app')
  // , man               = require('./manual')
  // ;

var Contextify = require('contextify');
var sandbox = { console : console, prop1 : 'prop1'};
Contextify(sandbox);
sandbox.run('console.log(prop1);');

// sandbox.dispose(); // free the resources allocated for the context.
setTimeout(function(){
  sandbox.dispose();
}, 30 * 1000);
