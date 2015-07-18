
var PrettyError = require('pretty-error')
  , _           = require('underscore')
  ;

var pe = new PrettyError();

pe.skip(function(traceLine, lineNumber){
   return /^\/.*\.js$/.test(traceLine.path);
});

function sigkill(req, res) {
  res.end();
  process.exit();
}

function catchall(req, res) {
  res.status(403).json({
    '#system' : {
        type    : 'exception'
      , error   : 'invalid sdk route'
      , details : req.url
    }
  });
}

function mapError(err) {
  var obj = pe.getObject(err)['pretty-error']
    , ret = {
          type      : obj.header.title.kind
        , error     : obj.header.message
        , trace     : _.compact(_.map(obj.trace, function(i) {
            return i.item.footer? i.item.footer.addr : undefined;
          }))
      }
    ;

  if (process.env.NODE_ENV !== 'production') {
    ret.debug = obj;
    ret.message = err.toString();
  }

  var start = _.findLastIndex(ret.trace, function(i){
    return i[0] === '@';
  });

  ret.trace = _.first(ret.trace, start + 1);

  return ret;
}

function error(err, req, res, next) {
  var exclude = [
    '/home/'
  ];

  var ret = {
    '#code' : mapError(err)
  };;

  if (req.xhr) {
    res.status(500).send(ret);
  } else {
    res.status(500).send(ret);
  }
}

module.exports = {
    sigkill   : sigkill
  , catchall  : catchall
  , error     : error
};