// var clock = new p5.Part();
// clock.setBPM(52);
// clock.onStep(playNext);

var clockInterval = '64';

function initTone() {
  Tone.Transport.setBpm(output.header.bpm);
  Tone.Transport.start();
  Tone.Transport.setInterval(playNext, clockInterval+'n');

}

window.onload = function() {
  startMidiJS();
}

function startMidiJS() {
  MIDI.loadPlugin({
      soundfontUrl: "../lib/MIDI.js/soundfont/",
      instruments: ["electric_piano_1", "fretless_bass", "voice_oohs", "synth_strings_1", "electric_guitar_muted", "string_ensemble_2"],
      callback: function() {
        for (var i in programChanges) {
          MIDI.programChange(programChanges[i][0], programChanges[i][1]);
        }
        initTone();
        console.log('midi loaded!');
      }
    });
};


function playNext() {
  var oneIncrement = 1/ parseInt(clockInterval) * 4;
  console.log(oneIncrement);

  for (var i in output.sketches) {
    var thisSketch = output.sketches[i];
    thisSketch.beatsSinceLastNote += oneIncrement;
    var seq = thisSketch.sequence;
    var pos = thisSketch.needlePos;

    if (seq.deltaTimes[pos % seq.deltaTimes.length] - thisSketch.beatsSinceLastNote < oneIncrement) {
      var stringSinceLastBeat = (thisSketch.beatsSinceLastNote - seq.deltaTimes[pos % seq.deltaTimes.length] ).toString();
      nextBeat = Tone.Transport.transportTimeToSeconds(stringSinceLastBeat);
      var note = seq.notes[pos % seq.notes.length];
      var velocity = seq.velocities[pos % seq.velocities.length] * output.sketches[i].volume;
      var duration = seq.durations[pos % seq.durations.length];
      MIDI.noteOn(i, note, velocity, Math.abs(nextBeat));
      MIDI.noteOff(i, note, duration + Math.abs(nextBeat));

      // increment position
      thisSketch.needlePos++;

      // reset beatsSinceLastNote
      thisSketch.beatsSinceLastNote = 0;
    }
  }

}

function regenerateSequence() {
  // sequence = noteTransitioner.generate('random');
  index = 0;
}

// click to regenerate the sequence
window.onmouseup = function() {regenerateSequence()};