var vm                = require('vm')
  , _                 = require('underscore')
  , domain            = require('domain')
  , Promise           = require('bluebird')
  , util              = require('util')
  , url               = require('url')
  , qs                = require('qs')
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

  this.code = es6.code;

  this.script = new vm.Script(this.code, { filename : this.options.filename });

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
    // todo [akamel] can throw 'Script execution timed out.' explain to user / otherwise hard to understand
    this.script.runInContext(this.context, { timeout : 2000 });

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

      // req.url = req.headers['x-tm-req-url'];
      // todo [akamel] we technicaly have the parsed querystring in the agent before
      // it emits the 'request' to the socket; do we really need to repaose?
      var tm_req = JSON.parse(req.headers['x-tm-req']);
      _.extend(req, tm_req);

      var search = url.parse(req.url).search;
      if (search) {
        search = search.substring(1);
      }

      req.query = qs.parse(search, {
          allowDots       : false
        , allowPrototypes : true
      });

      // express exposes app on req; remove it...
      delete req.app;
      fct.call(app, req, res, next);
    } else {
      // todo [akamel] unset content-type header
      var err = new Error('module.exports not set to a function');
      err.help_url = 'https://taskmill.io/help';

      throw err;
    }
  }.bind(this));
};

module.exports = Sandbox;