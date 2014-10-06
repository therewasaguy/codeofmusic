var bpm;
var beatsPerMeasure;
var beatLength;
var ticksPerBeat;

var clock;

var currentMeasure;
var currentBeat;
var howFarInMeasure;

var seqRadius;

var pattern = []

function setup() {
  bpm = 120;
  ticksPerBeat = 16;
  beatsPerMeasure = 16;
  pattern = new Array(beatsPerMeasure);
  beatLength = 60 * 1000 / bpm;
  clock = new p5.Part(beatsPerMeasure, 1/ticksPerBeat/4);
  clock.loop();
  clock.setBPM(120);
  clock.onStep(tick);

  // interface
  createCanvas(400, 400);
  seqRadius = 300;
}

function draw() {
  background(50);

  push();
  translate(width/2, height/2);
  stroke(100);
  noFill();
  ellipse(0, 0, seqRadius*2, seqRadius*2);

  var beatAngle = TWO_PI / beatsPerMeasure;

  // draw grid lines
  for (var i = 0; i < beatsPerMeasure; i++) {
    stroke(100);
    // find out position of the current beat in polar coordinates (angle, radius)
    // the radius is the same for all beats: seqRadius
    var curBeatAngle = beatAngle * i;
    var beat_x = cos(curBeatAngle) * seqRadius;
    var beat_y = sin(curBeatAngle) * seqRadius;
    line(0, 0, beat_x, beat_y);

    // highlight current beat
    if (i === currentBeat){
      fill(200);
      noStroke();
      arc(0, 0, seqRadius*2, seqRadius*2, curBeatAngle, curBeatAngle + beatAngle);
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
  if (ticks % ticksPerBeat === 0) {
    beats += 1;
    currentBeat = beats % beatsPerMeasure;
    currentMeasure = Math.floor(beats / beatsPerMeasure);
    console.log(currentMeasure + ' : ' + currentBeat);
  }

  var ticksPerMeasure = beatsPerMeasure * ticksPerBeat;
  howFarInMeasure = (ticks % ticksPerMeasure) / ticksPerMeasure;
}

var slices = [];
function mousePressed() {
  new Slice(mouseX, mouseY);
}


// ============
// Slice class
// ============
var Slice = function(x, y) {
  console.log(x, y);
  this.x = x - width/2;
  this.y = y - height/2;
  this.radius = dist(this.x, this.y, 0, 0);
  this.c = [255, 255, 255];
  var angle = Math.abs( Math.atan2(this.y, -this.x) - PI );// - Math.atan2(height/2, width);
  var step = Math.floor( map(angle, 0, TWO_PI, 0, beatsPerMeasure) );

  // if there is already a block at this step, remove it
  if (pattern[step] !== undefined) {
    pattern[step].remove();
    console.log('remove');
  }

  pattern[step] = this;
  this.angle = step * TWO_PI/beatsPerMeasure;
}

Slice.prototype.update = function() {
  this.c[2] += 20;
  this.c[1] += 20;
  fill(this.c);
  arc(0, 0, this.radius*2, this.radius*2, this.angle, this.angle + TWO_PI/beatsPerMeasure);
  // rect(this.x, this.y, this.w, this.h);
}

Slice.prototype.isTouching = function(x, y) {
  if ( (this.x <= x) &&  (x <= (this.x + this.w) ) && (this.y <= y) && (y <= (this.y + this.h) ) ) {
    return true;
  }
  else {
    return false;
  }
}

Slice.prototype.remove = function() {
  // slices.slice(this);
  // update drumPattern array to zero
  // var whichDrum = drumArray.length - Math.round( map(this.y, 0, height, hDiv, 0) );
  // var whichStep = Math.round(map(this.x, 0, width, 0, wDiv));
  // drumPatterns[whichDrum][whichStep] = null;

}
