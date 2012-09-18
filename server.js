var esl = require('esl'),
message = require('./lib/recorder.js');

var server = esl.createCallServer();
server.on('CONNECT', function (call){
  var mode = call.body.variable_mode;
  console.log("new call " + mode);
  switch (mode){
  case 'record':
    message.record(call);
    break;
  case 'playback' :
    message.play(call);
    break;
  default:
    call.command('hangup');
  }
});

server.listen(9998);
