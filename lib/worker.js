var _                 = require('underscore')
  , Promise           = require('bluebird')
  // , http              = require('http')
  , localtunnel       = require('localtunnel')
  , responseTime      = require('response-time')
  , config            = require('config')
  , url               = require('url')
  , express           = require('express')
  , onFinished        = require('on-finished')
  , Code              = require(config.get('code-module'))
  , request           = require('./request')
  , App               = require('./app')
  ;


function Worker(options) {
  // this.options = options || {};
}

Worker.prototype.listen = function(options, cb) {
  options = options || {};

  options.port = options.port || config.port || 80;

  var tunnel_url  = url.format({
      protocol : config.get('tunnel.protocol')
    , hostname : config.get('tunnel.host')
    , port     : config.get('tunnel.port')
  });

  var tunnel_opts = { 
      host      : tunnel_url
    , subdomain : config.get('req.id')
  };

  var p$tunnel  = Promise.promisify(localtunnel)(options.port, tunnel_opts)
    , p$http    = Promise.try(() => {
                    var http  = express()
                      , me    = this
                      ;

                    http.use(responseTime({ header : 'x-tm-response-time-worker' }));
                    http.use(function(req, res, next){
                      clearTimeout(me.timeout_for_req_start_token);

                      onFinished(res, function (err, res) {
                        me.exit(err, res);
                      });

                      me.run(config.get('req'), req, res, _.once((err) => {
                        res.status(500).send(me.errorify(err));
                      }));
                    });

                    return Promise.promisify(http.listen, http)(options.port);
                  })
    ;

  Promise
    .all([p$tunnel, p$http])
    .then(() => {
      this.timeout_for_req_start_token = setTimeout(() => { 
        this.exit(new Error('no requests received after connection to relay'));
      }, 10 * 1000);
    })
    .nodeify(cb)
    ;
};

Worker.prototype.exit = function(err) {
  if (err) {
    var msg = _.isError(err)? err.message : err.toString();
    console.error(msg);
  }

  // todo [akamel] using timeout otherwise relay crashes with socket error
  setTimeout(() => {
    process.exit();
  }, 4 * 1000);
};

Worker.prototype.run = function(data, req, res, next) {
  var code = new Code(data);

  // todo [akamel] should this be on req.manual or req.app.manual
  req.details   = data;  
  req.manual    = data.manual;
  req.metadata  = data.metadata;

  var mw        = request.middleware(req, data.manual)
    , err_next  = (err) => { 
        err.source = code.source;
        next(err);
      }
    ;

  mw(req, res, function(){
    try {
      req.app = new App(req, res);

      code.run(req, res, next);
    } catch(err) {
      err_next(err);
    }
  });
};

Worker.prototype.errorify = function(err) {
  var ret = {
      type    : 'notification'
    , target  : 'taskmill-core-worker'
  };

  if (_.isError(err)) {
    ret.type      = err.name;
    ret.error     = err.message;
    ret.message   = err.toString();
    ret.stack     = err.stack;
  };

  if (_.has(err, 'help_url')) {
    ret.details = err.help_url;
  }

  return ret;
};

module.exports = Worker;