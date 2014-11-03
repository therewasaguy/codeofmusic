var ac = new AudioContext();

var MonoSynth = function(audioContext, preset) {
  ac = audioContext;
  this.output = ac.createGain();
  this.output.connect(ac.destination);

  var preset = preset || 'brass';
  this._preset = presets[preset];
  this._isPlaying = false;
};

MonoSynth.prototype.triggerAttack = function(freq, velocity) {
  // generate the oscillator
  var velocity = velocity || 1;
  var freq = freq || 220;

  if (!this._isPlaying) {
    this.osc = this.regenerate();
    this.osc.frequency.exponentialRampToValueAtTime(freq, ac.currentTime);
    this.osc.connect(this.output);
    this._isPlaying = true;
    this.osc.start();
    this.output.gain.cancelScheduledValues(ac.currentTime);
    this.output.gain.linearRampToValueAtTime(velocity, ac.currentTime + 0.01);
  }
  else {
    this.osc.frequency.exponentialRampToValueAtTime(freq, ac.currentTime + 0.05);
  }
};

MonoSynth.prototype.triggerRelease = function(releaseTime) {
  var releaseTime = releaseTime || 0.2;
  this.output.gain.cancelScheduledValues(ac.currentTime);
  this.output.gain.linearRampToValueAtTime(0, ac.currentTime + releaseTime);
  this.osc.stop(ac.currentTime + releaseTime);
  this._isPlaying = false;
};

MonoSynth.prototype.regenerate = function() {
  var osc = ac.createOscillator();
  var real = new Float32Array(this._preset.real);
  var imag = new Float32Array(this._preset.imag);

  var wave = ac.createPeriodicWave(real, imag);
  osc.setPeriodicWave(wave);

  return osc;
};

MonoSynth.prototype.setPreset = function(preset) {
  if (preset in presets) {
    this._preset = null;
    this._preset = presets[preset];
  } else {
    throw 'undefined preset';
  }
};

MonoSynth.prototype.setFreq = function(freq) {
  this.osc.frequency.exponentialRampToValueAtTime(freq, ac.currentTime);
};

synth = new MonoSynth(ac);
window.onmousedown = function(e) {
  var freq = Math.random() * 400 + 40;
  synth.triggerAttack(freq);
};

window.onmouseup = function(e) {
  synth.triggerRelease();
};