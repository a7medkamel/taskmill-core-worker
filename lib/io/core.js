
var filterStack = require('filter-stack');

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
    '#code' : {
        type    : 'exception'
      , error   : filterStack(err, exclude)
    }
  };;

  res.status(500).send(ret);
}

module.exports = {
    sigkill   : sigkill
  , catchall  : catchall
  , error     : error
};