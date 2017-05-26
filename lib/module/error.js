var _ = require('lodash');

function errorify(err) {
  var ret = {
      type    : 'notification'
    , target  : 'taskmill-core-worker'
  };

  if (_.isError(err)) {
    ret.type      = err.name;
    ret.error     = err.message;
    ret.message   = err.toString();
    ret.stack     = err.stack;
  } else {
    ret.message   = err.toString();
  }

  if (_.has(err, 'help_url')) {
    ret.details = err.help_url;
  }

  return ret;
};


module.exports = {
  errorify
}