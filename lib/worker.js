var express           = require('express')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , _                 = require('underscore')
  , stringify         = require('json-stringify-safe')
  , core              = require('./io/core')
  , stdout            = require('./stdout')
  ;

var io_core           = require('./io/core')
  , io_code           = require('./io/code')
  ;

function Worker(options) {
  this.options = options || {};

  this.Code = this.options.Code;

  if (!_.isFunction(this.Code)) {
    // throw new Error('A Code constructor was not passed to worker base class');
  }

  this.app = express();
  this.http = require('http').Server(this.app);
  this.io = require('socket.io')(this.http, {
      pingInterval  : 6 * 1000
    , pingTimeout   : 17 * 1000
  });

  var me = this;
  this.io.on('connection', function(socket){
    socket.on('request', function(data, cb){
      me.reqs[data.id] = data;
      cb();
    });
  });

  this.set_routes();
  this.set_middleware();
}

Worker.prototype.set_routes = function(){
  var me = this;

  this.app.all('/execute', function(req, res, next){
    var id    = req.headers['x-tm-id']
      , data  = me.reqs[id]
      ;

    if (data) {
      delete me.reqs[id];

      io_code.run.call(this, me, data, req, res, next);
    } else {
      core.error(new Error('data id not found: ' + id), req, res);
    }
  });

  this.app.get('/', io_code.stats);

  this.app.post('/SIGKILL', io_core.sigkill);
};

Worker.prototype.set_middleware = function(){
  this.app.use(responseTime({
    header : 'x-tm-response-time-worker'
  }));

  this.app.use(io_core.catchall);
  this.app.use(io_core.error);
};

Worker.prototype.reqs = {};

Worker.prototype.stdout = function(id){
  var param = _.rest(arguments);
  this.io.emit('stdout', id, stdout.toString.apply(this, param) + '\n');
};

Worker.prototype.stderr = function(id){
  var param = _.rest(arguments);
  this.io.emit('stderr', id, stdout.toString.apply(this, param) + '\n');
};

Worker.prototype.listen = function(options, cb) {
  this.http.listen(options.port, function(err, res){
    cb && cb(err, res);
  });
};

module.exports = Worker;