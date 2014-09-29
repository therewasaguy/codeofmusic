// HTTP Portion
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sequencerObject = {};

var snare = [], kick = [], hh = [], hho = [];

var tempo = 98;

for ( var i = 0; i < 16; i++ ){
	if (Math.random() > .5 ) 	snare.push(true);
		else 					snare.push(false);
	if (Math.random() > .5 ) 	kick.push(true);
		else 					kick.push(false);
	if (Math.random() > .5 ) 	hh.push(true);
		else 					hh.push(false);
	if (Math.random() > .5 ) 	hho.push(true);
		else 					hho.push(false);		
}

sequencerObject.snare = snare;
sequencerObject.kick = kick;
sequencerObject.hh = hh;
sequencerObject.hho = hho;

// console.log(sequencerObject);

app.get('/', function(req, res){
	var options = {
		root: __dirname + '/public/',
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	};

	res.sendFile('index.html', options);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);

		socket.broadcast.emit('init sequencer', sequencerObject);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('snare', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'change snare' " + data);
			
			// Send it to all of the clients
			socket.broadcast.emit('update sequence', data);
		});

		socket.on('kick', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'change kick' " + data);
			
			// Send it to all of the clients
			socket.broadcast.emit('update sequence', data);
		});

		socket.on('hh', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'change hh' " + data);
			
			// Send it to all of the clients
			socket.broadcast.emit('update sequence', data);
		});				

		socket.on('hho', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'change hho' " + data);
			
			// Send it to all of the clients
			socket.broadcast.emit('update sequence', data);
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);

