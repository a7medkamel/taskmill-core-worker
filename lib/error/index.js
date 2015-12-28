var _           = require('underscore')
  , config      = require('config')
  ;

function map(err) {
  var ret = undefined;

  if (_.isError(err)) {
    ret = {
        type      : err.name
      , error     : err.message
      , message   : err.toString()
    };

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