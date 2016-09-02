var _                 = require('lodash')
  , Promise           = require('bluebird')
  , config            = require('config')
  , express           = require('express')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , onFinished        = require('on-finished')
  , App               = require('./app')
  ;

function Worker() { }

Worker.prototype.listen = function(options, cb) {
  return Promise
          .fromCallback((cb) => {
            var http = express();

            http.use(responseTime({ header : 'x-response-time-container' }));
            http.use(bodyParser.json());
            http.use(bodyParser.text({ type : ['text/*', 'application/javascript', 'application/xml'] }));
            http.use(bodyParser.urlencoded({ extended: false }));

            http.use((req, res, next) => {
              if (req.url === '/') {
                return res.end();
              }

              console.log(`> req: ${req.url}`);
              clearTimeout(this.timeout_for_req_start_token);

              onFinished(res, (err, res) => {
                this.exit(err, res);
              });


              this.run(req, res, _.once((err) => {
                res.status(500).send(this.errorify(err));
              }));
            });

            // needs to stay as function to allow for the bind to 'this'
            http.listen(config.get('port'), function(err, res) {
              if (!err) {
                res = { port : this.address().port };
              }
              
              console.log(`> listening ${process.uptime()}`);
              cb(err, res);
            })
          })
          .then(() => {
            this.timeout_for_req_start_token = setTimeout(() => { 
              this.exit(new Error('no requests received after bootup'));
            }, 10 * 1000);
          })
          .asCallback(cb);
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

Worker.prototype.run = function(req, res, next) {
  // todo [akamel] this can fail in __metadata is empty
  let data = JSON.parse(req.get('__metadata'));
  // todo [akamel] maybe move this to after listen? no need to wait for req to come in
  var Code = require(config.get('code-module'));

  var code = new Code(data);

  // todo [akamel] should this be on req.manual or req.app.manual
  req.details   = data;  
  // req.manual    = data.manual;

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