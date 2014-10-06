var bpm;
var beatsPerMeasure;
var beatLength;
var ticksPerBeat;

var clock;

var currentMeasure;
var currentBeat;
var howFarInMeasure;

var seqRadius;

function setup() {
  bpm = 120;
  ticksPerBeat = 16;
  beatsPerMeasure = 16;
  beatLength = 60 * 1000 / bpm;
  clock = new p5.Part(beatsPerMeasure, 1/ticksPerBeat);
  clock.loop();
  clock.setBPM(120);
  clock.onStep(tick);

  // interface
  createCanvas(400, 400);
  seqRadius = 100;
}

function draw() {
  background(50);

  push();
  translate(width/2, height/2);
  stroke(100);
  noFill();
  ellipse(0, 0, seqRadius*2, seqRadius*2);

  var beatAngle = TWO_PI / beatsPerMeasure;

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
  // console.log(ticksPerMeasure);
}
