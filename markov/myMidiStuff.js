function loadRemote(path, callback) {
  var fetch = new XMLHttpRequest();
  fetch.open('GET', path);
  fetch.overrideMimeType("text/plain; charset=x-user-defined");
  fetch.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      /* munge response into a binary string */
      var t = this.responseText || "" ;
      var ff = [];
      var mx = t.length;
      var scc= String.fromCharCode;
      for (var z = 0; z < mx; z++) {
        ff[z] = scc(t.charCodeAt(z) & 255);
      }
      callback(ff.join(""));
    }
  }
  fetch.send();
}

loadRemote('../midifiles/michael_jackson-billie_jean.mid', makeMidi);
// loadRemote('../midifiles/stevie_wonder-superstition.mid', makeMidi);

var midiFile;
var m;

var output = {'header': {'bpm': 120, 'timeSignature': [4, 4], 'voices': {} }, 'channel': [], 'sketches':{} };


function makeMidi(data){
  midiFile = MidiFile(data);

  output.header.ticksPerBeat = midiFile.header.ticksPerBeat;

  for (var i in midiFile.tracks) {
    parseTrackData(midiFile.tracks[i], output);
  }

  // generate UI and track conrollers
  createChannels(output);
  // var pianoMidiData = midiFile.tracks[0];

  // // make a markov of note transitions
  noteTransitioner = new MarkovGenerator(2, 5);
  var pianoTrack = parseNotes(midiFile.tracks[0]);
  noteTransitioner.feed(pianoTrack);
  sequence = noteTransitioner.generate();
  // make a markov that maps notes to durations
}

function parseTrackData(trackData, output) {

  var currentTime = 0;

  for (var i in trackData) {

    currentTime += trackData[i].deltaTime;

    // parse bpm and time signature
    if (trackData[i].type === 'meta'){
      if (trackData[i].subtype === 'setTempo') {
        output.header.bpm = 60000000 / trackData[i]['microsecondsPerBeat'];
      }
      else if (trackData[i].subtype === 'timeSignature') {
        output.header.timeSignature[0] = trackData[i].numerator;
        output.header.timeSignature[1] = trackData[i].denominator;
      }
    }

    // parse voices from channel names
    else if (trackData[i].subtype === 'programChange'){
      // console.log(trackData[i]);
      var channel = trackData[i].channel;
      var program = trackData[i].programNumber;
      if (typeof (output.header.voices[channel]) === 'undefined') {
        output.header.voices[channel] = {};
      }
      output.header.voices[channel].program = program;
    }

    // control changes
    // http://www.midi.org/techspecs/midimessages.php
    else if (trackData[i].subtype === 'controller') {
      switch(trackData[i].controllerType) {
        case 7:
          //volume
          if (typeof (output.header.voices[trackData[i].channel]) === 'undefined') {
            output.header.voices[trackData[i].channel] = {};
          }
          output.header.voices[trackData[i].channel].volume = trackData[i].value;
          break;
        case 10:
          // pan
          if (typeof (output.header.voices[trackData[i].channel]) === 'undefined') {
            output.header.voices[trackData[i].channel] = {};
          }
          output.header.voices[trackData[i].channel].pan = trackData[i].value;
          break;
        case 11:
        case 91:
        case 93:
      }
    }

    // tally the noteOff's
    else if (trackData[i].subtype === 'noteOff' || trackData[i].subtype === 'noteOn' && trackData[i].velocity === 0) {
      var note = trackData[i].noteNumber;
      var chan = trackData[i].channel;
      if (typeof(note) == 'number') {
        if (typeof(output.channel[chan]) === 'undefined') {
          output.channel[chan] = [];
        }
        var currentBeat = deltaTimeToMeter(currentTime);

        // find the corresponding noteOn event and add to that event
        for (var j = output.channel[chan].length - 1; j >= 0; j--) {
          var prevEvnt = output.channel[chan][j];
          if (prevEvnt.note === note && typeof(prevEvnt.noteOff) === 'undefined') {
            var duration = currentBeat - prevEvnt.noteOn;
            prevEvnt.duration = duration;
            prevEvnt.noteOff = currentBeat;
            break;
          }
        }
      }
    }

    // tally the noteOn's
    else if (trackData[i].subtype === 'noteOn') {
      var note = trackData[i].noteNumber;
      var chan = trackData[i].channel;
      if (typeof(note) == 'number') {
        if (typeof(output.channel[chan]) === 'undefined') {
          output.channel[chan] = [];
        }
        var currentBeat = deltaTimeToMeter(currentTime);
        output.channel[chan].push( {
          'note' : note,
          'noteOn' : currentBeat,
          'velocity' : trackData[i].velocity
        });
      }
    }

  }
}

/*
 deltaTime is the number of 'ticks' from the previous event, and is represented as a variable length quantity.
 */

// via tone.js
function deltaTimeToMeter(deltaTime){
  var timeSigValue = output.header.timeSignature[0] / (output.header.timeSignature[1] / 4);
  var quarters = deltaTime / output.header.ticksPerBeat;
  return quarters;
}


function parseNotes(trackData) {
  var trackTimeline = [];
  for (var i in trackData) {
    if (trackData[i].subtype === 'noteOn') {
      var note = trackData[i].noteNumber;
      if (typeof(note) !== 'number') {
        console.log(note);
      }
      trackTimeline.push(note);
    }
  }
  return trackTimeline;
}