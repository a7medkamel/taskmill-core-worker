var bodyParser        = require('body-parser')
  , _                 = require('underscore')
  , Promise           = require('bluebird')
  , Sandbox           = require('../sandbox')
  , request           = require('../request')
  , core              = require('./core')
  ;

function exec(worker, data, req, res, next) {
  _stats.total++;

  // todo [akamel] if an async error is thrown; we won't respond correctly
  var sandbox = new Sandbox(worker, data);

  var mw = request.passthrough;

  var content_type  = req.get('content-type')
    , mime_type     = undefined
    , type          = undefined
    ;

  if (sandbox.manual.input) {
    mime_type = sandbox.manual.input['content-type'];
    type = sandbox.manual.input['type'];
  }

  req.manual = sandbox.manual;

  switch(type) {
    case 'buffer':
    mw = bodyParser.raw({ type : '*/*'/*content_type*/ });
    break;

    case 'stream':
    break;

    default:
    mw = request.middleware(req, mime_type);
  }

    // req.on('data', function(){console.log(arguments)});
  Promise
      .promisify(mw)(req, res)
      .then(function(){
        return Promise.promisify(sandbox.handle, sandbox)(req, res);
      })
      .catch(function(err){
        err.blob = sandbox.code;
        // todo [akamel] explicitly call core.error because default err handler is not working
        core.error(err, req, res);
        // next(err);
      });
}

var _stats = {
    total : 0
};

function stats(req, res) {
  res.send(_stats);
}

module.exports = {
    exec  : exec
  , stats : stats
};