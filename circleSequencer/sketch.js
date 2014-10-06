var bpm;
var beatsPerMeasure;
var beatLength;
var ticksPerBeat;
var ticksPerMeasure;

var clock;

var currentMeasure;
var currentBeat;
var currentTick;
var howFarInMeasure;

var seqRadius;

var pattern = []

// array of oscillators and envelopes
var oscillators = [];
var envelopes = [];
var current = 0; // array position of the oscillator/env

// midi notes
var noteArray = [0, 2, 4, 7, 9, 12];
var noteArrayColors = [];
for (var j in noteArray) {
  noteArrayColors[j] = [Math.floor(Math.random()*255),Math.floor(Math.random()*255)]; 
}
var root = 48;


function setup() {
  bpm = 120;
  ticksPerBeat = 3;
  beatsPerMeasure = 8;
  pattern = new Array(beatsPerMeasure);
  beatLength = 60 * 1000 / bpm;
  clock = new p5.Part(beatsPerMeasure, 1/ticksPerBeat/4);
  clock.loop();
  clock.setBPM(120);
  clock.onStep(tick);

  // interface
  createCanvas(400, 400);
  seqRadius = 300;

  // sound setup
  for (var i = 0; i <= 8; i++) {
    oscillators.push( new p5.Oscillator() );
    envelopes.push( new p5.Env(0.005, 0.65, 0.5, 0.2) );
  }

  ticksPerMeasure = beatsPerMeasure * ticksPerBeat;

}

function draw() {
  background(50);

  push();
  translate(width/2, height/2);
  stroke(100);
  noFill();
  ellipse(0, 0, seqRadius*2, seqRadius*2);

  var beatAngle = TWO_PI / beatsPerMeasure;
  var tickAngle = TWO_PI / ticksPerMeasure;
  // draw grid lines
  for (var i = 0; i < beatsPerMeasure; i++) {
    stroke(100);
    // find out position of the current beat in polar coordinates (angle, radius)
    // the radius is the same for all beats: seqRadius
    var curBeatAngle = beatAngle * i;
    var beat_x = cos(curBeatAngle) * seqRadius;
    var beat_y = sin(curBeatAngle) * seqRadius;
    line(0, 0, beat_x, beat_y);
  }
  for (var j = 0; j < ticksPerMeasure; j++) {
    var curTickAngle = tickAngle * j;

    // highlight current beat
    if (j === currentTick){
      fill(200);
      noStroke();
      arc(0, 0, seqRadius*2, seqRadius*2, curTickAngle, curTickAngle + tickAngle/ticksPerBeat);
    }
  }

  // draw playhead
  stroke(219, 38, 118);
  var playHeadPos = map(howFarInMeasure, 0, 1, 0, TWO_PI);
  line(0, 0, cos(playHeadPos)*seqRadius, sin(playHeadPos)*seqRadius);

  for (var j in pattern) {
    if (pattern[j] instanceof Slice) {
      pattern[j].update();
    }
  }

  pop();
}

var ticks = 0;
var beats = 0;
function tick(time) {
  ticks += 1;

  currentTick = ticks % ticksPerMeasure;
  if (pattern[currentTick] instanceof Slice) {
    playNote(pattern[currentTick].radius);
    pattern[currentTick].c[2] = 0;
  }

  if (ticks % ticksPerBeat === 0) {
    beats += 1;
    currentBeat = beats % beatsPerMeasure;
    currentMeasure = Math.floor(beats / beatsPerMeasure);
  }
  howFarInMeasure = (ticks % ticksPerMeasure) / ticksPerMeasure;
}

var slices = [];

function mousePressed() {
  if (dragging === false) {
    checkSlice(mouseX, mouseY);
  }
}

var dragging = false;
function mouseDragged() {
  dragging = true;
  checkSlice(mouseX, mouseY);
}

function mouseReleased() {
  dragging = false;
}


// ============
// Slice class
// ============
function checkSlice(_x, _y) {
  var x = _x - width/2;
  var y = _y - height/2;

  var angle = Math.abs( Math.atan2(y, -x) - PI );// - Math.atan2(height/2, width);
  var step = Math.floor( map(angle, 0, TWO_PI, 0, ticksPerMeasure) );

  if (dragging) {
    if (pattern[step] !== undefined) {
      pattern[step].radius = dist(mouseX - width/2, mouseY - height/2, 0, 0);
    }
  }

  else {
    // if there is already a block at this step, remove it
    if (pattern[step] !== undefined) {
      pattern[step] = undefined;
    } else {
      new Slice(x, y, angle);
    }
  }
}

var Slice = function(x, y, angle) {
  this.x = x;
  this.y = y;
  this.radius = dist(this.x, this.y, 0, 0);
  this.pos = constrain(Math.floor( map(this.radius, 0, dist(0,0,width/2,height/2), 0, noteArray.length-1) ), 0, noteArray.length-1);
  this.c = [noteArrayColors[this.pos][0], noteArrayColors[this.pos][1], 255];
  var step = Math.floor( map(angle, 0, TWO_PI, 0, ticksPerMeasure) );

  // if there is already a block at this step, remove it
  if (pattern[step] !== undefined) {
    console.log('remove');
  } else {
    pattern[step] = this;
    this.angle = step * TWO_PI/ticksPerMeasure;
  }
}

Slice.prototype.update = function() {
  this.c[2] += 10;
  this.pos = constrain(Math.floor( map(this.radius, 0, dist(0,0,width/2,height/2), 0, noteArray.length-1) ), 0, noteArray.length-1);
  this.c = [noteArrayColors[this.pos][0], noteArrayColors[this.pos][1], this.c[2]];

  fill(this.c);
  arc(0, 0, this.radius*2, this.radius*2, this.angle, this.angle + TWO_PI/ticksPerMeasure);
}

function playNote(radius) {
  var pos = Math.floor( map(radius, 0, dist(0,0,width/2,height/2), 0, noteArray.length) );
  var n = noteArray[pos] + root;
  var osc = oscillators[current % (oscillators.length- 1)];
  var env = envelopes[current % (envelopes.length - 1)];
  osc.freq(midiToFreq(n));
  env.play(osc);
  current++;
}