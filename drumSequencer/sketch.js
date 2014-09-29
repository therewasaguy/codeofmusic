// array of oscillators and envelopes
var oscillators = [];
var envelopes = [];
var current = 0; // array position of the oscillator/env

// drums
// var kick = new Tone.FMSynth();
// kick.setPreset('myKick');
// var snare = new Tone.FMSynth();
// snare.setPreset('mySnare');
var kick = new Tone.Sampler('audio/kick.mp3');
var snare = new Tone.Sampler('audio/snare.mp3');
var hh = new Tone.Sampler('audio/hh.mp3');
var hho =new Tone.Sampler('audio/hho.mp3');
var drumArray = [kick, snare, hh, hho];
for (var i in drumArray) {
  drumArray[i].toMaster();
}

// var socket = new io();

// io.sockets.on('init Sequencer', function(data) {
//   console.log(data);
// });

// how many blocks fit horizontally and vertically:
var hDiv = drumArray.length;
var wDiv = 16;

// array of Blocks
var blocks = [];

// ==================
// DRUM PATTERN STUFF
// ==================
var kickArray = new Array(wDiv);
var snareArray = new Array(wDiv);
var hhArray = new Array(wDiv);
var hhoArray = new Array(wDiv);
var drumPatterns = [kickArray, snareArray, hhArray, hhoArray];

// set all the drums to 0 empty to start
function clearBlocks() {
  for (var i in drumPatterns) {
    for (var j = 0; j < wDiv; j++) {
      drumPatterns[i][j] = false;
    }
  }
  blocks = [];
}

function parseSeqObj(data) {
  clearBlocks();
  kickArray = data.kick;
  snareArray = data.snare;
  hhArray = data.hh;
  hhoArray = data.hho;
  drumPatterns = [kickArray, snareArray, hhArray, hhoArray];
  for (var i in drumPatterns) {
    for (var j = 0; j < wDiv; j++) {
      if (drumPatterns[i][j] === true) {
        console.log(i, j);
        var bX = width/wDiv * j;
        var bY = height/hDiv * i;
        blocks.push( new Block(bX, bY));
      };
    }
  }
}

// test data
var sequencerObject = {};
sequencerObject.snare = [];
sequencerObject.kick = [];
sequencerObject.hh = [];
sequencerObject.hho = [];

for ( var i = 0; i < 16; i++ ){
  if (Math.random() > .5 )  sequencerObject.snare.push(true);
    else          sequencerObject.snare.push(false);
  if (Math.random() > .5 )  sequencerObject.kick.push(true);
    else          sequencerObject.kick.push(false);
  if (Math.random() > .5 )  sequencerObject.hh.push(true);
    else          sequencerObject.hh.push(false);
  if (Math.random() > .5 )  sequencerObject.hho.push(true);
    else          sequencerObject.hho.push(false);    
}



function setup() {
  createCanvas(800, 400);

  // set up blocks
  parseSeqObj(sequencerObject);

  // make the synths and envelopes
  for (var i = 0; i <= 8; i++) {
    // oscillators.push( new p5.Oscillator() );
    // envelopes.push( new p5.Env(0.005, 0.65, 0.5, 0.2) );
  }

  Tone.Transport.setInterval(function(time){
    increment(time);
  }, "16n");
  Tone.Transport.start();
  Tone.Transport.setBpm(90);
}

var step = 0;
function increment(time) {
  step++;
  for (var i in blocks) {
    var stepColumn = map( (step%wDiv), 0, wDiv, 0, width);
    if (blocks[i].x === stepColumn) {
      var whichDrum = Math.round( map(blocks[i].y, 0, height, hDiv, 0) ) - 1;
      playDrum(whichDrum, time);
      blocks[i].c[1] = 0;
      blocks[i].c[2] = 0;
    }
  }
}

function playDrum(whichDrum, time) {
  drumArray[whichDrum].triggerAttackRelease(1, time);
  current++;
}

function draw() {
  background(0);
  for (var i in blocks) {
    blocks[i].update();
  }
}

var pressedX, pressedY;
function mousePressed() {
  // if it is touching a preexisting block, remove that block
  pressedX = null;
  pressedY = null;
  for (var i in blocks) {
    if (blocks[i].isTouching(mouseX, mouseY) ) {
      pressedX = blocks[i].x;
      pressedY = blocks[i].y;
      blocks[i].remove();
      blocks.splice(i, 1);
    }
  }
}

function mouseDragged() {
  var halfBlockWidth = width/wDiv/2;
  var halfBlockHeight = height/hDiv/2;

  pressedX = null;
  pressedY = null;
  rect(mouseX - halfBlockWidth, mouseY - halfBlockHeight, width/wDiv, height/hDiv);
}

function mouseReleased() {
  // map block position to grid

  var halfBlockWidth = width/wDiv/2;
  var halfBlockHeight = height/hDiv/2;
  var bX = Math.round(map(mouseX - halfBlockWidth, 0, width, 0, wDiv))/wDiv * width;
  var bY = Math.round(map(mouseY - halfBlockHeight, 0, height, 0, hDiv))/hDiv * height;
  // do not re-add block if mouse is in same place
  if (bX === pressedX && bY === pressedY) {
    return;
  }
  if (pressedX !== null && Math.abs(pmouseX - mouseX) < 3 && Math.abs(pmouseY - mouseY) < 3) {
    return;
  }
  // only add block if mouse is within width/height of canvas
  if (bX < width && bX >= 0 && bY < height && bY >= 0) {
    blocks.push( new Block(bX, bY));
  }
}

var Block = function(x, y) {
  this.x = x;
  this.y = y;
  this.w = width/wDiv;
  this.h = height/hDiv;
  this.c = [255, 255, 255];

  // update drumPattern array
  var whichDrum = Math.round( map(this.y, 0, height, hDiv, 0) ) - 1;
  var whichStep = Math.round(map(this.x, 0, width, 0, wDiv));
  drumPatterns[whichDrum][whichStep] = true;
}

Block.prototype.update = function() {
  this.c[2] += 20;
  this.c[1] += 20;
  fill(this.c);
  rect(this.x, this.y, this.w, this.h);
}

Block.prototype.isTouching = function(x, y) {
  if ( (this.x <= x) &&  (x <= (this.x + this.w) ) && (this.y <= y) && (y <= (this.y + this.h) ) ) {
    return true;
  }
  else {
    return false;
  }
}

Block.prototype.remove = function() {
  // update drumPattern array to zero
  var whichDrum = Math.round( map(this.y, 0, height, hDiv, 0) ) - 1;
  var whichStep = Math.round(map(this.x, 0, width, 0, wDiv));
  drumPatterns[whichDrum][whichStep] = false;
}