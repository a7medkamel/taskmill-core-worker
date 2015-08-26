var express           = require('express')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , _                 = require('underscore')
  , stringify         = require('json-stringify-safe')
  , core              = require('./io/core')
  ;


var io_core           = require('./io/core')
  , io_exec           = require('./io/exec')
  , io_socket         = require('./io/socket')
  ;

function Worker() {
  var app             = express()
    , http            = require('http').Server(app)
    , io              = require('socket.io')(http, {
          pingInterval  : 6 * 1000
        , pingTimeout   : 17 * 1000
      })
    , me              = this
  ;

  // todo [akamel] doesn't seem to be working
  // app.set('json spaces', 2);

  // io.set('heartbeat timeout', 20);

  io.on('connection', function(socket){
    socket.on('task', function(msg, cb){
      // todo [akamel] make sure to leave after req ends
      // socket.join(msg.id);
      me.reqs[msg.id] = msg;
      cb();
    });
  });

  app.use(responseTime({
    header : 'x-tm-response-time-worker'
  }));

  app.all('/execute', function(req, res, next){
    var id        = req.headers['x-tm-id']
      , execution = me.reqs[id]
      ;

    if (execution)
    {
      delete me.reqs[id];

      io_exec.exec.call(this, me, execution, req, res, next);
    } else {
      core.error(new Error('execution id not found: ' + id), req, res);
    }
  });

  app.get('/', io_exec.stats);

  app.post('/SIGKILL', io_core.sigkill);

  app.use(io_core.catchall);
  app.use(io_core.error);

  this.http = http;
  this.io = io;
}

Worker.prototype.reqs = {};

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

Worker.prototype.stdout = function(id){
  var param = _.rest(arguments);
  this.io.to(id).emit('stdout', id, toString.apply(this, param) + '\n');
};

Worker.prototype.stderr = function(id){
  var param = _.rest(arguments);
  this.io.to(id).emit('stderr', id, toString.apply(this, param) + '\n');
};

Worker.prototype.listen = function(options, cb) {
  this.http.listen(options.port, function(err, res){
    cb && cb(err, res);
  });
};

module.exports = Worker;