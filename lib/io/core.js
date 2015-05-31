
var exec = require('./exec');

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

function stats(req, res) {
  res.send(exec.stats);
}

module.exports = {
    sigkill   : sigkill
  , catchall  : catchall
};