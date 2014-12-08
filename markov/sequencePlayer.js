var clock = new p5.Part();
clock.setBPM(52);
clock.onStep(playNext);

window.onload = function() {
  startMidiJS();
}

function startMidiJS() {
  MIDI.loadPlugin({
      soundfontUrl: "../lib/MIDI.js/soundfont/",
      instruments: ["electric_piano_1", "fretless_bass", "synth_strings_1", "voice_oohs", "electric_guitar_muted", "string_ensemble_2"],
      callback: function() {
        // MIDI.programChange(0, 5);
        // MIDI.programChange(1, 108);
        // clock.loop();
        console.log('midi loaded!');
      }
    });
};

var index = 0;
var sequence = [];


function playNext() {
  // var frequency = p5.prototype.midiToFreq(sequence[index%(sequence.length-1)])
  // osc.freq(frequency);
  // env.play(osc);
  MIDI.noteOn(1, sequence[index%(sequence.length-1)], 65, 0);

  index++;
}

function regenerateSequence() {
  sequence = noteTransitioner.generate('random');
  index = 0;
}

// click to regenerate the sequence
window.onmouseup = function() {regenerateSequence()};