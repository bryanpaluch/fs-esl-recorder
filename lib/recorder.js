var fs = require('fs'),
request = require('request'),
child_process = require('child_process'),
uuid = require('node-uuid');

var record_dir = '/data/voicedata/';
var play_message = function play_message(call,cb){
  createFifo(call,play);
}

var record_message = function record_message(call,cb){
  console.log("recording message hit");
  createFifo(call,record);
}
var createFifo = function create(call,cb){

  var file = uuid.v1();
  var fifo_path = record_dir + file + '.wav';
  console.log("creating pipe " + fifo_path);
  child_process.exec('rm -f ' + fifo_path +'; /usr/bin/mkfifo -m 0660 ' + fifo_path, null, function(err, stdout, stderr){
    console.log("fifo created");
    cb(call,fifo_path);
  });


}
var url = 'http://127.0.0.1:9999/voicemessage/TEST.wav';
var play = function play(call, loc, cb){
  fs.createWriteStream(loc).pipe(request.get(url , function(e, r, b){
  }));
  console.log("trying to playback" + loc);
  call.command('play_and_get_digits', '1 1 1 1000 # ' + loc + ' silence_stream://250 choice \\d 1000', function(call){
    console.log("finished playback");
    hangup(call);
  });
}

var record  = function record(call,loc,cb){
  console.log("record hit");
  console.log("reading from " + loc);
  var file = 'TEST.wav';
  fs.createReadStream(loc).pipe(request.put('http://127.0.0.1:9999/voicemessage/' + file, function(e, r, b){
    console.log("connection to file server opened");
  }));
  call.command('set', 'RECORD_WRITE_ONLY=true', function(call){
    call.command('set', 'playback_terminators=#1234567890', function(call){
      call.command('gentones', '%(500,0,800)', function(call){
       call.command('record', loc + ' 20 200', function(call){
         console.log("finished recording");
         hangup(call);
        });
      });
    });
  });
}
var hangup = function hangup(call,cb){
  call.command('hangup');
}

exports.play = play_message;
exports.record = record_message;

