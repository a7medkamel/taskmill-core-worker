var _ = require('underscore')
  ;

function connection(socket){
  this.socket = socket;

  socket.on('execution', function(msg){
    socket.join(msg.id);
    this.reqs[msg.id] = msg;
  }.bind(this));
}

// todo [akamel] imepleemt disconnect

module.exports = {
    connection    : connection
};