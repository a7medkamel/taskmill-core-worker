
var _           = require('underscore')
  , stackTrace  = require('stack-trace')
  ;

// var pe = new PrettyError();

// pe.skip(function(traceLine, lineNumber){
//    return /^\/.*\.js$/.test(traceLine.path);
// });

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
  var ret = undefined;

  if (_.isError(err)) {
    var trace = stackTrace.parse(err);

    ret = {
        type      : typeof err
      , error     : err.message
      , trace     : _.map(trace, function(i) {
          return i.getFileName() + ':' + i.getLineNumber() + ':' + i.getColumnNumber();
        })
    };

    // if (process.env.NODE_ENV !== 'production') {
    //   ret.debug = obj;
    //   ret.message = err.toString();
    // }

    var start = _.findLastIndex(ret.trace, function(i){
      return i[0] === '@';
    });

    ret.trace = _.first(ret.trace, start + 1);

  } else {
    ret = {
        type    : 'Error'
      , inner   : err
    };
  }

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
    res.status(500).json(ret);
  } else {
    res.status(500).json(ret);
  }
}

module.exports = {
    sigkill   : sigkill
  , catchall  : catchall
  , error     : error
};