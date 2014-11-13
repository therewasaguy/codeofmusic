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

      loadRemote('./midifiles/22nkywydao.mid', makeMidi);

      var midiFile;
      var m;
      function makeMidi(data){
        midiFile = MidiFile(data);
        // console.log(midiFile);
        midiFile.tracks[4];
        var pianoMidiData = midiFile.tracks[4];

        // make a markov of note transitions
        noteTransitioner = new MarkovGenerator(2, 5);
        var pianoTrack = parseTrackData(midiFile.tracks[4]);
        noteTransitioner.feed(pianoTrack);
        sequence = noteTransitioner.generate();
        // make a markov that maps notes to durations
      }

/*
 deltaTime is the number of 'ticks' from the previous event, and is represented as a variable length quantity.

 */

      function parseTrackData(trackData) {
        var trackTimeline = [];
        for (var i in trackData) {
          if (trackData[i].subtype === 'noteOn') {
            var note = trackData[i].noteNumber;
            // {
            //   deltaTime : trackData[i].deltaTime,
            //   noteNumber : trackData[i].noteNumber,
            //   velocity: trackData[i].velocity
            // }
            if (typeof(note) !== 'number') {
              console.log(note);
            }
            trackTimeline.push(note);
          }
        }
        return trackTimeline;
      }