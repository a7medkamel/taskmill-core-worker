var _                 = require('underscore')
  , Promise           = require('bluebird')
  , config            = require('config')
  , url               = require('url')
  ;

function Worker() { }

function promise_time(p$, msg) {
  var s_hrtime = process.hrtime();
  return p$.tap(function(){
    var diff = process.hrtime(s_hrtime)
      , span = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2) + 'ms'
      ;

    console.log(msg, span);
  });
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

  var p$tunnel  = Promise.method(() => {
                    var localtunnel = require('localtunnel');

                    return Promise.promisify(localtunnel)(options.port, tunnel_opts);
                  })
    , p$http    = Promise.method(() => {
                    var express       = require('express')
                      , responseTime  = require('response-time')
                      , bodyParser    = require('body-parser')
                      , request       = require('./request')
                      , onFinished    = require('on-finished')
                      , http          = express()
                      , me            = this
                      ;

                    http.use(responseTime({ header : 'x-tm-response-time-worker' }));
                    http.use(request.middleware(config.get('req').manual));
                    http.use(bodyParser.json());
                    http.use(bodyParser.text({ type : ['text/*', 'application/javascript', 'application/xml'] }));
                    http.use(bodyParser.urlencoded({ extended: false }));

                    http.use(function(req, res, next){
                      clearTimeout(me.timeout_for_req_start_token);

                      onFinished(res, function (err, res) {
                        me.exit(err, res);
                      });

                      me.run(config.get('req'), req, res, _.once((err) => {
                        res.status(500).send(me.errorify(err));
                      }));
                    });

                    return Promise.promisify(http.listen, { context : http })(options.port);
                  })
    ;

  // p$tunnel = promise_time(p$tunnel(), 'tunnel-connection-time');
  // p$http = promise_time(p$http(), 'express-server-listen-time');

  Promise
    .all([ p$tunnel(), p$http() ])
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
  // todo [akamel] maybe move this to after listen? no need to wait for req to come in
  var Code = require(config.get('code-module'));

  var code = new Code(data);

  // todo [akamel] should this be on req.manual or req.app.manual
  req.details   = data;  
  req.manual    = data.manual;
  req.metadata  = data.metadata;

  if (_.has(req.manual, 'output')) {
    if (_.has(req.manual.output, 'content-type')) {
      res.set('Content-Type', req.manual.output['content-type']);
    }
  }

  var App = require('./app');

  try {
    req.app = new App(req, res);

    code.run(req, res, next);
  } catch (err) {
    err.source = code.source;
    next(err);
  }
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