var bodyParser        = require('body-parser')
  , _                 = require('underscore')
  , Promise           = require('bluebird')
  , qs                = require('qs')
  , url               = require('url')
  , request           = require('../request')
  ;

function run(worker, data, req, res, next) {
  // todo [akamel] if an async error is thrown; we won't respond correctly
  // todo [akamel] make this switch if smaller [single line]
  var code = new worker.Code(worker, data);

  var mw = request.passthrough;

  var content_type  = req.get('content-type')
    , mime_type     = undefined
    , type          = undefined
    ;

  if (code.manual.input) {
    mime_type = code.manual.input['content-type'];
    type = code.manual.input['type'];
  }

  req.manual = code.manual;

  switch(type) {
    case 'buffer':
    mw = bodyParser.raw({ type : '*/*'/*content_type*/ });
    break;

    case 'stream':
    break;

    default:
    mw = request.middleware(req, mime_type);
  }

  Promise
      .promisify(mw)(req, res)
      .then(function(){
        return new Promise(function(resolve, reject){
          resolve = _.once(resolve);
          reject = _.once(reject);

          // resolve/reject on res end
          res
            .on('finish', resolve)
            .on('error', reject)
            ;

          // req.url = req.headers['x-tm-req-url'];
          // todo [akamel] we technicaly have the parsed querystring in the agent before
          // it emits the 'request' to the socket; do we really need to repaose?
          // var tm_req = JSON.parse(req.headers['x-tm-req']);
          // _.extend(req, tm_req);

          var search = url.parse(req.url).search;
          if (search) {
            search = search.substring(1);
          }

          req.query = qs.parse(search, {
              allowDots       : false
            , allowPrototypes : true
          });

          code.run(req, res, function(err){
            if (err) {
              reject(err);
            } else {
              reject('cannot call next without an error argument');
            }
          });
        });
      })
      .catch(function(err){
        err.source = code.source;
        next(err);
      });
}

module.exports = {
    run   : run
};