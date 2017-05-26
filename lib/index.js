var _                 = require('lodash')
  , Promise           = require('bluebird')
  , config            = require('config')
  , express           = require('express')
  , morgan            = require('morgan')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , App               = require('./app')
  , error             = require('./module/error')
  , Code              = require(config.get('code-module'));
  ;

var app = express();

app.use((req, res, next) => {
  if (req.url === '/') {
    return res.end();
  }

  next();
});

app.use(morgan('dev'));
app.use(responseTime({ header : 'x-response-time-container' }));
app.use((req, res, next) => {
  Promise
    .try(() => {
      req.__metadata = JSON.parse(req.get('__metadata'));
      // console.dir(req.__metadata, { depth : 10 });
    })
    .catch(() => {})
    .asCallback(next);
});

app.use((req, res, next) => {
  let pragma = _.get(req, '__metadata.manual.pragma')
    , stream = _.some(pragma, (str) => str === 'stream');

  // if streaming, set _body to true, prevents bodyParser from reading the stream
  req._body = stream;

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.text({ type : ['text/*', 'application/javascript', 'application/xml'] }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  Promise
    .try(() => {
      // req.breadboard = new App(req, res);
      // todo [akamel] clean this up, we now augment the express app
      App(req, res);

      let data = {
          remote    : config.get('remote')
        , sha       : config.get('sha')
        , base_url  : config.get('base_url')
      };

      return (new Code(data)).run(req, res, next);
    })
    .asCallback(next);
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).send(error.errorify(err));
  }

  return res.end();
});

app.listen(config.get('port'));