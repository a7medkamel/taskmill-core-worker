var bodyParser        = require('body-parser')
  , _                 = require('underscore')
  , Promise           = require('bluebird')
  , Sandbox           = require('../sandbox')
  , request           = require('../request')
  ;

var stats = {
    total : 0
  , error : 0
};

function exec(execution, req, res, next) {
  // todo [akamel] we are ignoring the inbound 'next' function
  // todo [akamel] know that Error is not sendable in res.end
  // next = function(err) {
  //   console.error('rest level next', err);
  //   res.send(err);
  // };

  stats.total++;

  next = _.once(next);

  req.url = req.headers['$originalurl'];
  // todo [akamel] if an async error is thrown; we won't respond correctly
  try {
    var sandbox = new Sandbox(this, execution);

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
      mw = bodyParser.raw({ type : content_type });
      break;

      case 'stream':
      break;

      default:
      mw = request.middleware(req, mime_type);
    }

    Promise
      .promisify(mw)(req, res)
      .then(function(){
        return Promise.promisify(sandbox.handle, sandbox)(req, res);
      })
      .catch(function(err){
        next(err);
      })
  } catch (err){
    stats.error++;
    next(err);
  }
}




module.exports = {
    exec  : exec
  , stats : stats
};