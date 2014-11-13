var osc = new p5.Oscillator();
var env = new p5.Env(0.01, 0.9, 0.2, 0.1, 0.05, 0, 0.0, 0.0);

var clock = new p5.Part();
clock.setBPM(52);
clock.loop();
clock.onStep(playNext);

var index = 0;
var sequence = [];

function playNext() {
  var frequency = p5.prototype.midiToFreq(sequence[index%(sequence.length-1)])
  osc.freq(frequency);
  env.play(osc);
  index++;
}

function regenerateSequence() {
  sequence = noteTransitioner.generate('random');
  index = 0;
}

// click to regenerate the sequence
window.onmouseup = function() {regenerateSequence()};