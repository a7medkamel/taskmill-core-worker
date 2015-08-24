
var _           = require('underscore')
  , error_util  = require('../error')
  ;

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
    sigkill   : sigkill
  , catchall  : catchall
  , error     : error
};