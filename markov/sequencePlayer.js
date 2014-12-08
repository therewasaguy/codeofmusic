// var clock = new p5.Part();
// clock.setBPM(52);
// clock.onStep(playNext);

var clockInterval = '64';

window.onload = function() {
  startMidiJS();
}

function startMidiJS() {
  MIDI.loadPlugin({
      soundfontUrl: "../lib/MIDI.js/soundfont/",

      // instruments: ["electric_piano_1", "fretless_bass", "voice_oohs", "synth_strings_1", "electric_guitar_muted", "string_ensemble_2"],

      callback: function() {

        // for (var i in programChanges) {
        //   MIDI.programChange(programChanges[i][0], programChanges[i][1]);
        // }

        initTone();
        console.log('midi loaded!');
      }
    });
};

function initTone() {
  Tone.Transport.setBpm(output.header.bpm);
  Tone.Transport.start();
  Tone.Transport.setInterval(playNext, clockInterval+'n');
  loadDrumChannel();
}

var drumPlayers = {};
function loadDrumChannel() {
  for (var i = 35; i <= 81; i++) {
    drumPlayers[i] = new Tone.Player('../lib/MIDI.js/soundfont/drums_fluidv3/'+i+'.mp3');
    drumPlayers[i].retrigger = true;
    drumPlayers[i].toMaster();
  }
  console.log('drums loaded!');
}

var timeElapsed = 0;
function playNext() {
  var oneIncrement = 1/ parseInt(clockInterval) * 4;

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
      var duration = seq.durations[pos % seq.notes.length % seq.durations.length];

      if (i === '9') {
        drumPlayers[note].setVolume(drumPlayers[note].gainToDb(output.sketches[i].volume));
        drumPlayers[note].start(0);
      } else {
        MIDI.noteOn(i, note, velocity, Math.abs(nextBeat));
        MIDI.noteOff(i, note, duration + Math.abs(nextBeat));
      }

      thisSketch.lightUp(duration);
      // increment position
      thisSketch.needlePos++;

      // reset beatsSinceLastNote
      thisSketch.beatsSinceLastNote = 0;

    }
  }

  timeElapsed += oneIncrement;
}

function regenerateSequence() {
  // sequence = noteTransitioner.generate('random');
  index = 0;
}

// click to regenerate the sequence
window.onmouseup = function() {regenerateSequence()};