var _ = require('underscore');

function toString(/*params*/) {
  function single(arg) {
    if (_.isString(arg)) {
      return arg;
    } else if (_.isError(arg) || _.isNaN(arg) || _.isNumber(arg) || _.isFunction(arg) || _.isRegExp(arg)) {
      return arg.toString();
    } else if (_.isObject(arg) || _.isArray(arg) || _.isArguments(arg) || _.isBoolean(arg) || _.isDate(arg) || _.isNull(arg)) {
      return stringify(arg);
    } else if (_.isUndefined(arg)) {
      return 'undefined';
    } else if (!_.isFinite(arg)) {
      return arg.toString();
    }

    return arg;
  }

  return (_.map(arguments, function(item){
    return single(item);
  })).join(' ');
}

module.exports = {
    toString : toString
};