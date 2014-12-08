/**
 *  COLOR SCHEME via http://paletton.com/#uid=33g0s0k006h2M++l-sjsIkhyUeV
 */
var colorSchemes = {
  'A': [
              [31, 31, 31],
              [233, 255, 253],
              [45, 139, 132],
              [10, 99, 93],
              [0, 73, 69]
   ],
   'B': [
               [50, 50, 50],
               [255,233,233],
               [226, 74, 74],
               [162, 17, 17],
               [119,  0,  0]
   ],
   'C': [
                [50, 50, 50],
                [255,247,233],
                [226,171, 74],
                [162,110, 17],
                [119, 76,  0]
                ]
}
var colorRotation = ['A', 'B', 'A', 'C'];
var colorPos = 0;


/**
 *  slider dimensions
 */
var sliderWidth, sliderHeight;

/**
 *  SLIDER SKETCH TEMPLATE
 */
var sliderSketch = function(sketch) {
  var dragging = false;
  var slidePos = - sliderHeight * 0.75 ;

  // data to generate the markov chain
  var channelData;

  // assign color scheme
  sketch.colorScheme = colorSchemes[colorRotation[colorPos % colorRotation.length]];
  colorPos++;

  sketch.setup = function() {
    sketch.cnv = sketch.createCanvas(sliderWidth,sliderHeight);
    sketch.background(sketch.colorScheme[0]);
    sketch.fill(sketch.colorScheme[2]);
    sketch.noStroke();


    sketch.setupMouseInteraction();
  }

  sketch.draw = function() {
    sketch.background(sketch.colorScheme[0]);
    sketch.rect(0, sketch.height, sketch.width, slidePos);
    sketch.volume = sketch.map(slidePos + sketch.height, sketch.height, 0.0, 0.0, 1.0);
    // console.log(sketch.volume);
  }

  // SETUP MOUSE INTERACTION
  sketch.setupMouseInteraction = function() {
    sketch.cnv.canvas.onmousedown = function() {
      dragging = true;
    }
    sketch.cnv.canvas.onmouseup = function() {
      dragging = false;
    }
    sketch.cnv.canvas.onmousemove = function() {
      if (dragging) {
        slidePos = sketch.mouseY - sketch.height;
      }
    }
    sketch.cnv.canvas.onmouseleave = function() {
      sketch.cnv.canvas.onmouseup();
    }
  }

  // sketches have multiple types of sequences associated with them
  // output.channel[chan] = {'sequence': [], 'durations': [], 'deltaTimes': [], 'velocities': [], 'notes': [], 'chords': [] };
  sketch.sequence = {
    'durations': [],
    'deltaTimes': [],
    'velocities': [],
    'notes': [],
    'chords': []
  };

  // sketches can generate markovs
  sketch.markovGens = {
    'durations': new MarkovGenerator(2, 4),
    'deltaTimes': new MarkovGenerator(2, 4),
    'velocities': new MarkovGenerator(2, 4),
    'notes': new MarkovGenerator(2, 4),
    'chords': new MarkovGenerator(2, 4)
  }

  // feed this markov generator
  sketch.feedMarkov = function(stuff) {
    channelData = stuff;
    sketch.markovGens['durations'].feed(channelData.durations);
    sketch.markovGens['deltaTimes'].feed(channelData.deltaTimes);
    sketch.markovGens['velocities'].feed(channelData.velocities);
    sketch.markovGens['notes'].feed(channelData.notes);

    // determine whether it will play chords or melody?
    if (stuff.chords.length > 10) {
      sketch.markovGens['chords'].feed(channelData.chords);
    }

    sketch.generateNewSequence();
  }

  sketch.generateNewSequence = function() {
    sketch.sequence.durations = sketch.markovGens['durations'].generate();
    sketch.sequence.deltaTimes = sketch.markovGens['deltaTimes'].generate();
    sketch.sequence.velocities = sketch.markovGens['velocities'].generate();
    sketch.sequence.notes = sketch.markovGens['notes'].generate();
    sketch.sequence.chords = sketch.markovGens['chords'].generate();
  }

  sketch.needlePos = 0;
  sketch.beatsSinceLastNote = 0;

};


var programChanges = [];

function createChannels(midiInfo) {
  sliderWidth = window.innerWidth / Object.keys(output.header.voices).length;
  sliderHeight = window.innerHeight;

  for (var j in output.header.voices) {
    // console.log(output.header.voices[j]['program']);
    output.sketches[j] = new p5(sliderSketch);

    // assign midi voice
    if (j === '9') {
      console.log('drum channel')
    } else {
      // prepare to make all the program changes / set instruments once midi.js loads
      programChanges.push([ j, output.header.voices[j]['program'] ])
    }

    output.channel[j].sequence = null;
    output.sketches[j].feedMarkov(output.channel[j]);
  }

  cleanUpJunk();
}


function cleanUpJunk() {
  midiFile = null;
}

function getFrameRate() {
  for (i in output.sketches) {
    console.log(output.sketches[i].frameRate())
  };
}
