var Console = require('./console').Console;

function Context(worker, id){
  // these need to be defined inside the create function to sandbox them
  this.console = new Console(worker, id);

  this.module        = {}
  this.require       = require
  // this.eval          = eval
  this.setTimeout    = setTimeout
  this.setInterval   = setInterval
  this.clearTimeout  = clearTimeout
  this.clearInterval = clearInterval
  this.process       = {
     hrtime     : process.hrtime
  }
  this.Buffer        = Buffer
  this.Error         = Error
  this.EvalError     = EvalError
  // this.InternalError = InternalError
  this.RangeError    = RangeError
  this.ReferenceError= ReferenceError
  this.SyntaxError   = SyntaxError
  this.TypeError     = TypeError
  this.URIError      = URIError
  this.Object        = Object
  this.JSON          = JSON
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