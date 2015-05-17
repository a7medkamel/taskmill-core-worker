var util = require('util');

function Console(worker, id){
  this.log = function() {
    worker.stdout(id, arguments[0]);
  };

  this.error = function() {
    worker.stderr(id, arguments[0]);
  };
}

Console.prototype.times = {};

Console.prototype.info = function() {
  this.log.apply(this, arguments);
}

Console.prototype.warn = function() {
  this.log.apply(this, arguments);
}

Console.prototype.time = function(label) {
  this.times[label] = Date.now();
}

Console.prototype.timeEnd = function(label) {
  var time = this.times[label];

  if (!time) {
      throw new Error('No such label: ' + label);
  }

  delete this.times[label];

  var duration = Date.now() - time;
  this.log(label + ': ' + duration + 'ms');
}

Console.prototype.trace = function() {
  var err = new Error();
  err.name = 'Trace';
  err.message = util.format.apply(null, arguments);
  this.error(err.stack);
}

Console.prototype.dir = function(object, options) {
  this.log(util.inspect(object, options) + '\n');
}

Console.prototype.assert = function(expression) {
  if (!expression) {
    var arr = Array.prototype.slice.call(arguments, 1);
    this.error(util.format.apply(null, arr));
  }
}


module.exports = {
    Console : Console
};