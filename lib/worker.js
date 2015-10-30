var _                 = require('underscore')
  // , express           = require('express')
  // , express_req       = require(__dirname + '/../node_modules/express/lib/request')
  // , express_res       = require(__dirname + '/../node_modules/express/lib/response')
  , socket_io         = require('socket.io')
  , http              = require('http')
  , responseTime      = require('response-time')
  , bodyParser        = require('body-parser')
  , stringify         = require('json-stringify-safe')
  , core              = require('./io/core')
  , config            = require('config')
  , stdout            = require('./stdout')
  ;

var io_core           = require('./io/core')
  , io_code           = require('./io/code')
  ;

function Worker(options) {
  this.options = options || {};

  this.Code = this.options.Code;

  if (!_.isFunction(this.Code)) {
    throw new Error('A Code constructor was not passed to worker base class');
  }

  // this.app = express();
  var response_time = responseTime({ header : 'x-tm-response-time-worker' });

  var me = this;

  this.http = http.Server(function(req, res) {
    var app = {
        get : function(){}
      , req : req
      , res : res
    };

    req.__proto__ = require(__dirname + '/../node_modules/express/lib/request');
    res.__proto__ = require(__dirname + '/../node_modules/express/lib/response');

    _.extend(req, {
        app       : app
      , res       : res
    });

    _.extend(res, {
        app       : app
      , req       : req
    });

    var next = function(err) {
      core.error(err, req, res);
    }

    response_time(req, res, function() {
      if (req.url.match(/^\/execute$/g)) {
        var id    = req.headers['x-tm-id']
          , data  = me.reqs[id]
          ;

        if (data) {
          delete me.reqs[id];

          io_code.run.call(this, me, data, req, res, next);
        } else {
          core.error(new Error('data id not found: ' + id), req, res);
        }
      }
      else if (req.url.match(/^\/$/g)) {
        io_code.stats(req, res);
      }
      else if (req.url.match(/^\/SIGKILL$/g)) {
        io_core.sigkill(req, res);
      }
    });
  });

  this.io = socket_io(this.http, {
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

  // this.set_routes();
  // this.set_middleware();
}

// Worker.prototype.set_routes = function(){
//   var me = this;

//   this.app.all('/execute', function(req, res, next){
//     var id    = req.headers['x-tm-id']
//       , data  = me.reqs[id]
//       ;

//     if (data) {
//       delete me.reqs[id];

//       io_code.run.call(this, me, data, req, res, next);
//     } else {
//       core.error(new Error('data id not found: ' + id), req, res);
//     }
//   });

//   this.app.get('/', io_code.stats);

//   this.app.post('/SIGKILL', io_core.sigkill);
// };

// Worker.prototype.set_middleware = function(){
//   // this.app.use(responseTime({
//   //   header : 'x-tm-response-time-worker'
//   // }));

//   // this.app.use(io_core.catchall);
//   // this.app.use(io_core.error);
// };

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
  options = options || {};

  options.port = options.port || config.port || 80;

  this.http.listen(options.port, function(err, res){
    cb && cb(err, res);
  });
};

module.exports = Worker;