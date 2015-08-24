var _           = require('underscore')
  , stackTrace  = require('stack-trace')
  ;

function map(err) {
  var ret = undefined;

  if (_.isError(err)) {
    var trace = stackTrace.parse(err);

    ret = {
        type      : err.name
      , error     : err.message
      , trace     : _.map(trace, function(i) {
          return i.getFileName() + ':' + i.getLineNumber() + ':' + i.getColumnNumber();
        })
    };

    // if (process.env.NODE_ENV !== 'production') {
    //   ret.debug = obj;
    //   ret.message = err.toString();
    // }

    // console.log('wewasda', err);
    if (err.blob && trace[0] && trace[0].getFileName()[0] === '@') {
      var num   = trace[0].getLineNumber()
        , lines = err.blob.split(/\r?\n/)
        ;

      ret.line = _.last(_.first(lines, num + 3), 5);
    }

    var start = _.findLastIndex(ret.trace, function(i){
      return i[0] === '@';
    });

    ret.trace = _.first(ret.trace, start + 1);

    if (err.help_url) {
      ret.details = err.help_url;
    }
  } else {
    ret = err;
  }

  return ret;
}

module.exports = {
  map : map
};