var ac = new AudioContext();

var Synth = function(audioContext, preset) {
  ac = audioContext;
  this.output = ac.createGain();
  this.output.connect(ac.destination);

  var preset = preset || 'brass';
  this._preset = presets[preset];
};

Synth.prototype.play = function(midiNote, velocity) {
  // generate the oscillator
  this.osc = this.regenerate();

  this.osc.connect(this.output);
  this.osc.frequency.value = midiNote;
  this.osc.start();
  this.osc.stop(ac.currentTime + 2);
};

Synth.prototype.triggerAttack = function(midiNote, velocity) {
  // generate the oscillator
  var velocity = velocity || 1;
  var freq = midiNote || 220;
  this.osc = this.regenerate();

  this.osc.connect(this.output);
  this.osc.frequency.value = midiNote;
  this.osc.start();
  this.output.gain.linearRampToValueAtTime(velocity, ac.currentTime + 0.01);
};

Synth.prototype.triggerRelease = function(releaseTime) {
  var releaseTime = releaseTime || 0.2;
  this.output.gain.linearRampToValueAtTime(0, ac.currentTime + releaseTime);
  this.osc.stop(ac.currentTime + releaseTime);
};

Synth.prototype.regenerate = function() {
  var osc = ac.createOscillator();
  var real = new Float32Array(this._preset.real);
  var imag = new Float32Array(this._preset.imag);

  var wave = ac.createPeriodicWave(real, imag);
  osc.setPeriodicWave(wave);

  return osc;
};

Synth.prototype.setPreset = function(preset) {
  if (preset in presets) {
    this._preset = null;
    this._preset = presets[preset];
  } else {
    throw 'undefined preset';
  }
};

synth = new Synth(ac);
window.onmousedown = function(e) {
  var freq = Math.random() * 400 + 40;
  synth.triggerAttack(freq);
};

window.onmouseup = function(e) {
  synth.triggerRelease();
};