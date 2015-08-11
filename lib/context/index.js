var Console = require('./console').Console
  , _       = require('lodash')
  ;

function clone(any) {
  return _.cloneDeep(any, function(value) {
    if (_.isFunction(any)) {
      var temp = function temporary() { return any.apply(this, arguments); };
      for( key in any ) {
          temp[key] = clone(this[key]);
      }
      return temp;
    }
  });
}

function Context(worker, id){
  // these need to be defined inside the create function to sandbox them
  this.console = new Console(worker, id);

  this.module        = {}
  this.require       = clone(require)
  // this.eval          = eval
  this.setTimeout    = clone(setTimeout)
  this.setInterval   = clone(setInterval)
  this.clearTimeout  = clone(clearTimeout)
  this.clearInterval = clone(clearInterval)
  this.process       = {
     hrtime     : clone(process.hrtime)
  }
  this.Buffer        = clone(Buffer)
  this.Error         = clone(Error)
  this.EvalError     = clone(EvalError)
  // this.InternalError = InternalError
  this.RangeError    = clone(RangeError)
  this.ReferenceError= clone(ReferenceError)
  this.SyntaxError   = clone(SyntaxError)
  this.TypeError     = clone(TypeError)
  this.URIError      = clone(URIError)
  this.Object        = clone(Object)
  this.JSON          = clone(JSON)
}

module.exports = {
    Context : Context
};


  // , fs                = require('fs')

  // , mock_fs   = require('mock-fs')


//
// mock_fs();
// var local_restore = fs.restore;

// fs.restore = function() { throw new Error('Unable to restore'); };