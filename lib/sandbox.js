var vm                = require('vm')
  , _                 = require('underscore')
  , domain            = require('domain')
  , Promise           = require('bluebird')
  , util              = require('util')
  , babel             = require('babel-core')
  , App               = require('./app')
  , man               = require('taskmill-core-man')
  , Context           = require('./context').Context
  ;


function Sandbox(worker, options) {
  this.worker = worker;
  this.options = options;

  var code = options.content;

  var es6 = babel.transform(code); // => { code, map, ast }

  this.script = new vm.Script(es6.code, { filename : this.options.filename });

  this.context = vm.createContext(new Context(worker, options.id));

  this.manual = man.get(es6);
};

Sandbox.prototype.handle = function(req, res, next) {
  var next = _.once(next);

  var d = domain.create();

  d.on('error', function(err) {
    return next(err);
  });

  d.run(function() {
    this.script.runInContext(this.context, { timeout : 500 });

    var fct = this.context.module.exports;
    if (_.isFunction(fct)) {
      var app = new App(req, res, next, this.options);

      if (!_.isUndefined(this.manual.type)) {
        res.set('$type', this.manual.type);
      }

      if (this.manual.output) {
        if (_.has(this.manual.output, 'content-type')) {
          res.set('Content-Type', this.manual.output['content-type']);
        }
      }

      req.url = req.headers['$originalurl'];

      fct.call(app, req, res, next);
    } else {
      // todo [akamel] unset content-type header
      throw new Error('module.exports not set to a function');
    }
  }.bind(this));
};

module.exports = Sandbox;