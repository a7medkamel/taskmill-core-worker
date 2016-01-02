var _                 = require('underscore')
  , Promise           = require('bluebird')
  , http              = require('http')
  , localtunnel       = require('localtunnel')
  , responseTime      = require('response-time')
  , config            = require('config')
  , url               = require('url')
  , io_code           = require('./io/code')
  , io_core           = require('./io/core')
  , express           = require('express')
  ;

var tunnel_url  = url.format({
    protocol : config.get('tunnel.protocol')
  , hostname : config.get('tunnel.host')
  , port     : config.get('tunnel.port')
});

function Worker(options) {
  this.options = options || {};

  this.Code = this.options.Code;

  if (!_.isFunction(this.Code)) {
    throw new Error('A Code constructor was not passed to worker base class');
  }

  var me = this;

  this.http = express();

  this.http.use(responseTime({ header : 'x-tm-response-time-worker' }));
  this.http.use(function(req, res, next){
    // end process once req is closed [aborted]
    req.on('close', function(){ process.exit(); });

    var next = function(err) {
      io_core.error(err, req, res);
    }

    var data = JSON.parse(req.get['x-tm-req']);

    io_code.run.call(this, me, data, req, res, next);
  });
}

Worker.prototype.listen = function(options, cb) {
  options = options || {};

  options.port = options.port || config.port || 80;

  var tunnel_opts = { 
      host      : tunnel_url
    , subdomain : config.get('req.id')
  };

  var p$http    = Promise.promisify(this.http.listen, this.http)(options.port)
    , p$tunnel  = Promise.promisify(localtunnel)(options.port, tunnel_opts)
    ;

  Promise
    .all([p$tunnel, p$http])
    .nodeify(cb)
    ;
};

module.exports = Worker;