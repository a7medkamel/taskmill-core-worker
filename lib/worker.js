var _                 = require('lodash')
  , Promise           = require('bluebird')
  , retry             = require('bluebird-retry')
  , config            = require('config')
  , onHeaders         = require('on-headers')
  , url               = require('url')
  , express           = require('express')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , onFinished        = require('on-finished')
  , App               = require('./app')
  //
  , localtunnel       = require('localtunnel')
  ;

function Worker() { }

Worker.prototype.listen = function(options, cb) {
  options = options || {};

  if (!_.isNumber(options.port)) {
    options.port = config.get('port');
  }

  if (!_.isNumber(options.port)) {
    options.port = 80;
  }

  var tunnel = (port, tunnel_opts) => Promise.promisify(localtunnel)(port, tunnel_opts);

  var http = () => {
    var ret = express();

    ret.use(responseTime({ header : 'x-response-time-container' }));
    // ret.use(request.middleware(config.get('req').manual));
    ret.use(bodyParser.json());
    ret.use(bodyParser.text({ type : ['text/*', 'application/javascript', 'application/xml'] }));
    ret.use(bodyParser.urlencoded({ extended: false }));

    ret.use((req, res, next) => {
      clearTimeout(this.timeout_for_req_start_token);

      onFinished(res, (err, res) => {
        this.exit(err, res);
      });

      this.run(config.get('req'), req, res, _.once((err) => {
        res.status(500).send(this.errorify(err));
      }));
    });

    return Promise.resolve(ret);
  };

  function listen(http, port) {
    return new Promise((resolve, reject) => {
      // needs to stay as function to allow for the bind to 'this'
      http.listen(port, function(err, res) {
        if (err) {
          return reject(err);
        }

        // will be used when binding to port 0
        resolve({
          port : this.address().port
        })
      })
    });
  };

  var tunnel_opts = { 
      host      : config.get('tunnel.url')
    , subdomain : config.get('req.id')
  };

  var wait = undefined;
  if (options.port === 0) {
    wait = [ http()
            .then((http) => retry(() => listen(http, options), { max_tries: 1000, interval: 0, timeout: 5000 }))
            // .tap((result) => {
            //   console.log(result);
            // })
            .then((result) => tunnel(result.port, tunnel_opts)) ]
  } else {
    wait = [ 
        tunnel(options.port, tunnel_opts)
      , http().then((http) => retry(() => listen(http, options), { max_tries: 1000, interval: 0, timeout: 5000 }))
    ]
  }

  Promise
    .all(wait)
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

  onHeaders(res, function(){
    if (!this.getHeader('Content-Type') && _.has(req.manual, 'output') && _.has(req.manual.output, 'content-type')) {
      this.setHeader('Content-Type', req.manual.output['content-type']);
    }
  });

  try {
    // req.breadboard = new App(req, res);
    // todo [akamel] clean this up, we now augment the express app
    App(req, res);

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
  } else {
    ret.message   = err.toString();
  }

  if (_.has(err, 'help_url')) {
    ret.details = err.help_url;
  }

  return ret;
};

module.exports = Worker;