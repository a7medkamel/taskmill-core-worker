var _                 = require('lodash')
  , Promise           = require('bluebird')
  , config            = require('config')
  , express           = require('express')
  , morgan            = require('morgan')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , sdk               = require('./sdk')
  , error             = require('./module/error')
  , safe_parse        = require('safe-json-parse/tuple')
  , Code              = require(config.get('code-module'))
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
  let [ err, metadata ] = safe_parse(req.get('__metadata'));

  req.__metadata = metadata;

  // todo [akamel] save this on the req or the required module/cache
  Promise
    .try(() => {
      let { mime_type } = Code.func_info(req);

      if (mime_type == 'application/javascript') {
        return Code
                .man(req)
                .tap((manual) => {
                  req.__metadata.manual = manual;
                })
                .catch((err) => {
                  // suppress manual parsing error?
                  console.error('error parsing manual');
                  console.error(err);
                });
      }
    })
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
      sdk.extend(req, res);

      let data = {
          remote    : config.get('remote')
        , sha       : config.get('sha')
        , base_url  : config.get('base_url')
      };

      return (new Code(data)).run(req, res, next);
    })
    .catch(next);
});

app.use(function(err, req, res, next) {
  if (err) {
    res.status(500).send(error.errorify(err));
    return;
  }

  return res.end();
});

app.listen(config.get('port'));
