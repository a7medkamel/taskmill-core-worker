var bodyParser        = require('body-parser')
  , _                 = require('underscore')
  , Promise           = require('bluebird')
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

    if (/^application\/json/i.test(mime_type)) {
      mw = bodyParser.json({ type : content_type });
    } else if (/^text\/\w+/i.test(mime_type)) {
      mw = bodyParser.text({ type : content_type });
    } else if (/^application\/(?:javascript|xml)/i.test(mime_type)) {
      mw = bodyParser.text({ type : content_type });
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