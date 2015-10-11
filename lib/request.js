var bodyParser        = require('body-parser')
  , _                 = require('underscore')
  ;

function passthrough(req, res, cb){
  process.nextTick(cb);
}

function middleware(req, mime_type) {
  var content_type = req.get('content-type');

  var mw = passthrough;

  if (_.isUndefined(mime_type)) {
    mime_type = content_type;
  }

  if (_.isString(mime_type)) {
    // todo [akamel] hack because body parser has issues with function wildcard syntax
    if (_.isUndefined(content_type)) {
      req.headers['content-type'] = mime_type;
    }

    // todo [akamel] by overriding the content-type, we lose the charset
    if (/^application\/json/i.test(mime_type)) {
      mw = bodyParser.json({ type : '*/*' });
    } else if (/^text\/.+/i.test(mime_type)) {
      mw = bodyParser.text({ type : '*/*' });
    } else if (/^application\/(?:javascript|xml)/i.test(mime_type)) {
      mw = bodyParser.text({ type : '*/*' });
    }
  }

  return mw;
}

function parse(req, res, mime_type, next) {
  if (_.isFunction(mime_type)) {
    next = mime_type;
    mime_type = undefined;
  }

  var mw = middleware(req, mime_type);
  mw(req, res, next);
}

module.exports = {
    parse       : parse
  , middleware  : middleware
  , passthrough : passthrough
};