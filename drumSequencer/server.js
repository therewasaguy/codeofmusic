// HTTP Portion
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sequencerObject = {};

var snare = [], kick = [], hh = [], hho = [];

var tempo = 98;

for ( var i = 0; i < 16; i++ ){
	if (Math.random() > .5 ) 	snare.push(true);
		else 					snare.push(null);
	if (Math.random() > .5 ) 	kick.push(true);
		else 					kick.push(null);
	if (Math.random() > .5 ) 	hh.push(true);
		else 					hh.push(null);
	if (Math.random() > .5 ) 	hho.push(true);
		else 					hho.push(null);		
}


sequencerObject[3] = kick;
sequencerObject[2] = snare;
sequencerObject[1] = hh;
sequencerObject[0] = hho;

// console.log(sequencerObject);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res, err) {
	res.sendFile('index.html', { root: __dirname + '/public' });
});

app.set('port', (process.env.PORT || 3000))

http.listen(app.get('port'), function(){
  console.log('listening on *:3000');
});

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
		console.log("We have a new client: " + socket.id);

		socket.emit('initSequencer', sequencerObject);

		socket.on('changedPattern', function(data) {
			console.log('changed pattern!');
			sequencerObject = data;
			socket.broadcast.emit('updateSeq', data);
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});

	}
);

