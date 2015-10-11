var _           = require('underscore')
  , stackTrace  = require('stack-trace')
  , config      = require('config')
  ;

function map(err) {
  var ret = undefined;

  if (_.isError(err)) {
    var trace = stackTrace.parse(err);

    ret = {
        type      : err.name
      , error     : err.message
      , trace     : _.compact(_.map(trace, function(i) {
          if (!i.getFileName()) {
            return;
          }

          return i.getFileName() + ':' + i.getLineNumber() + ':' + i.getColumnNumber();
        }))
    };

    if (config.fullerror) {
      ret.message = err.toString();
    } else {
      if (err.source && _.size(trace)) {
        var trace_top = _.first(trace)
          , filename  = trace_top? trace_top.getFileName() : undefined
          ;

        if (_.first(filename) === '@') {
          var num   = trace_top.getLineNumber()
            , lines = err.source.split(/\r?\n/)
            ;

          ret.line = _.last(_.first(lines, num + 3), 5);
        }
      }

      var start = _.findLastIndex(ret.trace, function(i){
        return i[0] === '@';
      });
    }

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