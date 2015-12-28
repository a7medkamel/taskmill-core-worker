
var _           = require('underscore')
  , error_util  = require('../error')
  ;

function error(err, req, res, next) {
  var exclude = [
    '/home/'
  ];

  var ret = {
    '#code' : error_util.map(err)
  };;

  res.set('Content-Type', 'application/json');
  if (req.xhr) {
    res.status(500).json(ret);
  } else {
    res.status(500).json(ret);
  }
}

module.exports = {
    error     : error
};