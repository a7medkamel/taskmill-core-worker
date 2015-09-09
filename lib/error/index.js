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
          if (!i.getFileName()) {
            return;
          }

          return i.getFileName() + ':' + i.getLineNumber() + ':' + i.getColumnNumber();
        })
    };

    // if (process.env.NODE_ENV !== 'production') {
    //   ret.debug = obj;
    //   ret.message = err.toString();
    // }

    if (err.blob && _.size(trace)) {
      var trace_top = _.first(trace)
        , filename  = trace_top? trace_top.getFileName() : undefined
        ;

      if (_.first(filename) === '@') {
        var num   = trace_top.getLineNumber()
          , lines = err.blob.split(/\r?\n/)
          ;

        ret.line = _.last(_.first(lines, num + 3), 5);
      }
    }

    var start = _.findLastIndex(ret.trace, function(i){
      return i[0] === '@';
    });

    ret.trace = _.compact(_.first(ret.trace, start + 1));

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