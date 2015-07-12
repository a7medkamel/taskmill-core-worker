var express           = require('express')
  , bodyParser        = require('body-parser')
  , _                 = require('underscore')
  , stringify         = require('json-stringify-safe')
  ;


var io_core           = require('./io/core')
  , io_exec           = require('./io/exec')
  , io_socket         = require('./io/socket')
  ;

function Worker() {
  var app             = express()
    , http            = require('http').Server(app)
    , io              = require('socket.io')(http)
  ;

  io.on('connection', io_socket.connection.bind(this));

  app.all('/execute', function(req, res, next){
    var id        = req.headers['$execution-id']
      , execution = this.reqs[id]
      ;

    // console.log('concurrently running', _.keys(this.reqs).length);
    delete this.reqs[id];

    (io_exec.exec.bind(this))(execution, req, res, next);
  }.bind(this));

  app.get('/stats', io_exec.stats);

  app.post('/SIGKILL', io_core.sigkill);

  app.use(io_core.catchall);

  this.http = http;
  this.io = io;
}

Worker.prototype.reqs = {};

function toString(buf) {
  var ret = buf;

  if (_.isError(buf) || _.isNaN(buf) || _.isNumber(buf) || _.isFunction(buf) || _.isRegExp(buf) || !_.isFinite(buf)) {
    ret = buf.toString();
  }

  if (_.isObject(buf) || _.isArray(buf) || _.isArguments(buf) || _.isBoolean(buf) || _.isDate(buf) || _.isNull(buf)) {
    ret = stringify(buf);
  }

  if (_.isUndefined(buf)) {
    ret = 'undefined';
  }

  return ret;
}

Worker.prototype.stdout = function(id, buf){
  this.io.to(id).emit('stdout', id, toString(buf));
};

Worker.prototype.stderr = function(id, buf){
  this.io.to(id).emit('stderr', id, toString(buf));
};

Worker.prototype.listen = function(options, cb) {
  this.http.listen(options.port, function(err, res){
    cb && cb(err, res);
  });
};

module.exports = Worker;