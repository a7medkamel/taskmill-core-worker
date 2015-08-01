var _ = require('underscore')
  ;

function connection(socket){
  this.socket = socket;

  socket.on('execution', function(msg){
    // todo [akamel] make sure to leave after req ends
    socket.join(msg.id);
    this.reqs[msg.id] = msg;
  }.bind(this));
}

// todo [akamel] imepleemt disconnect

module.exports = {
    connection    : connection
};