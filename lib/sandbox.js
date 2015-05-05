var vm                = require('vm')
  , _                 = require('underscore')
  , domain            = require('domain')
  , Promise           = require('bluebird')
  , util              = require('util')
  , doctrine          = require('doctrine')
  , babel             = require('babel-core')
  , safe_parse        = require('safe-json-parse/tuple')
  , App               = require('./app')
  , man               = require('taskmill-core-man')
  , Context           = require('./context').Context
  ;


function Sandbox(agent, options) {
  this.agent = agent;
  this.options = options;

  var code = options.content;

  var es6 = babel.transform(code); // => { code, map, ast }

  this.script = new vm.Script(es6.code, { filename : this.options.filename });

  this.context = vm.createContext(new Context(agent, options.id));

  this.manual = man.get(es6);
};

Sandbox.prototype.handle = function(req, res, next) {
  var next = _.once(next);

  try {
    var d = domain.create();

    d.on('error', function(err) {
      console.error('domain error logged');
      next(err);
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

        fct.call(app, req, res, next);
      } else {
        // todo [akamel] unset content-type header
        next({
          '#system' : {
              type    : 'exception'
            , error   : 'module.exports not set to a function'
          }
        });
      }
    }.bind(this));
  } catch (err) {
    next(err);
  }
};

module.exports = Sandbox;