var Console = require('./console').Console;

function Context(agent, id){
  this.console = new Console(agent, id);
}

Context.prototype.module        = {}
Context.prototype.require       = require
// Context.prototype.eval          = eval
Context.prototype.setTimeout    = setTimeout
Context.prototype.setInterval   = setInterval
Context.prototype.clearTimeout  = clearTimeout
Context.prototype.clearInterval = clearInterval
Context.prototype.process       = {
   hrtime     : process.hrtime
}
Context.prototype.Buffer        = Buffer
Context.prototype.Error         = Error
Context.prototype.EvalError     = EvalError
// Context.prototype.InternalError = InternalError
Context.prototype.RangeError    = RangeError
Context.prototype.ReferenceError= ReferenceError
Context.prototype.SyntaxError   = SyntaxError
Context.prototype.TypeError     = TypeError
Context.prototype.URIError      = URIError
Context.prototype.Object        = Object
Context.prototype.JSON          = JSON

module.exports = {
    Context : Context
};


  // , fs                = require('fs')

  // , mock_fs   = require('mock-fs')


//
// mock_fs();
// var local_restore = fs.restore;

// fs.restore = function() { throw new Error('Unable to restore'); };