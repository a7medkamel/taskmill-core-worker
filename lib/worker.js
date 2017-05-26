var _                 = require('lodash')
  , Promise           = require('bluebird')
  , config            = require('config')
  , express           = require('express')
  , morgan            = require('morgan')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , App               = require('./app')
  , Code              = require(config.get('code-module'));
  ;

function Worker() { }

Worker.prototype.listen = function(options, cb) {
  return Promise
          .fromCallback((cb) => {
            var http = express();

            http.use((req, res, next) => {
              if (req.url === '/') {
                return res.end();
              }

              next();
            });

            http.use(morgan('dev'));
            http.use(responseTime({ header : 'x-response-time-container' }));
            http.use((req, res, next) => {
              Promise
                .try(() => {
                  req.__metadata = JSON.parse(req.get('__metadata'));
                })
                .asCallback(next);
            });

            http.use((req, res, next) => {
              let pragma = _.get(req, '__metadata.manual.pragma')
                , stream = _.some(pragma, (str) => str === 'stream');

              // if streaming, set _body to true, prevents bodyParser from reading the stream
              req._body = stream;

              next();
            });

            http.use(bodyParser.json());
            http.use(bodyParser.text({ type : ['text/*', 'application/javascript', 'application/xml'] }));
            http.use(bodyParser.urlencoded({ extended: false }));

            http.use((req, res, next) => {
              Promise
                .try(() => {
                  // req.breadboard = new App(req, res);
                  // todo [akamel] clean this up, we now augment the express app
                  App(req, res);

                  return (new Code(req.__metadata)).run(req, res, next);
                })
                .catch((err) => {
                  res.status(500).send(this.errorify(err));
                });
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
          .asCallback(cb);
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