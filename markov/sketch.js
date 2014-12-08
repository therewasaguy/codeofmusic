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
var transportHeight = 150;
var leftBarWidth = 200;

var boxCount = 2;
var sliderContainerWidth;
var sliderSnapValue = 8;

/**
 *  SLIDER SKETCH TEMPLATE
 */
var sliderSketch = function(sketch) {
  var dragging = false;
  var slidePos = - sliderHeight * 0.75 ;

  // data to generate the markov chain
  var channelData;
  var alphaValue = 0;
  // assign color scheme
  sketch.colorScheme = colorSchemes[colorRotation[colorPos % colorRotation.length]];
  // sketch.colorScheme2 = colorSchemes[colorRotation[colorPos - 1 % colorRotation.length]]
  // sketch.colorScheme3 = colorSchemes[colorRotation[colorPos - 2 % colorRotation.length]]
  colorPos++;

  sketch.setup = function() {
    sketch.cnv = sketch.createCanvas(sliderWidth,sliderHeight);
    sketch.background(sketch.colorScheme[0]);
    sketch.fill(sketch.colorScheme[2]);
    sketch.noStroke();

    sketch.setupMouseInteraction();
    sketch.resetPosition();
  }

  sketch.draw = function() {
    var val = sketch.map(alphaValue, 1, 0, 0, 1);
    var bgColor = sketch.lerpColor(sketch.colorScheme[0], sketch.colorScheme[4], alphaValue);
    sketch.background(bgColor);

    for (var i in sketch.slideBoxes) {
      sketch.slideBoxes[i].draw();
    }

    // values
    sketch.volume = sketch.slideBoxes[1].val;
    // sketch.speed = sketch.slideBoxes[1].val;
    // sketch.nNumber = sketch.slideBoxes[0].val;

    sketch.drawCursor();
    sketch.drawNotes();
    alphaValue *= 0.5;
  }

  sketch.drawCursor = function() {
    sketch.stroke(255,255,0);
    var relTime = (timeElapsed - sketch.regenTime) % sketch.sumOfDeltaTimes;
    var x = sketch.map(relTime, 0, sketch.sumOfDeltaTimes, sliderContainerWidth, sketch.width);
    sketch.line(x, 0, x, sketch.height);
  }

  sketch.drawNotes = function() {
    var elTime = 0;

    // find sketch min and max notes

    for (var i in sketch.sequence.notes) {
      elTime += sketch.sequence.deltaTimes[i];
      var note = sketch.sequence.notes[i];
      var duration = sketch.sequence.durations[i];
      var x = sketch.map(elTime, 0, sketch.sumOfDeltaTimes, sliderContainerWidth, sketch.width);
      var w = sketch.map(elTime + duration, 0, sketch.sumOfDeltaTimes, sliderContainerWidth, sketch.width);
      var y = sketch.map(note, sketch.maxNote, sketch.minNote, 0, sketch.height);
      var h = sketch.height / 52;
      sketch.noStroke();
      sketch.fill(sketch.colorScheme[1]);
      sketch.rect(x, y, 2, h);
    }
  }

  // SETUP MOUSE INTERACTION
  sketch.setupMouseInteraction = function() {
    sketch.cnv.canvas.onmousedown = function() {
      dragging = true;
    }
    sketch.cnv.canvas.onmouseup = function() {
      dragging = false;
      for (var i in sketch.slideBoxes) {
        if (sketch.slideBoxes[i].dragging) {
          var magicNum = sketch.slideBoxes[i].val * sliderSnapValue - 1;
          sketch.slideBoxes[i].val = Math.round(magicNum) / sliderSnapValue;
          sketch.slideBoxes[i].dragging = false;
          if (i == 0) {
            sketch.generateNewSequence(sketch.slideBoxes[0].val);
          }
          break;
        }
      }
    }
    sketch.cnv.canvas.onmousemove = function() {
      if (dragging) {
        // slidePos = sketch.mouseY - sketch.height;
        for (var i in sketch.slideBoxes) {
          if (sketch.slideBoxes[i].mouseTouching() ) {
            sketch.slideBoxes[i].dragging = true;
            break;
          }
        }
      }
    }
    sketch.cnv.canvas.onmouseleave = function() {
      sketch.cnv.canvas.onmouseup();
      for (var i in sketch.slideBoxes) {
        if (sketch.slideBoxes[i].dragging) {
          var magicNum = sketch.slideBoxes[i].val * sliderSnapValue - 1;
          sketch.slideBoxes[i].val = Math.round(magicNum) / sliderSnapValue;
          sketch.slideBoxes[i].dragging = false;
          if (i == 0) {
            sketch.generateNewSequence(sketch.slideBoxes[0].val);
          }
          break;
        }
      }
    }
  }



  // SLIDEBOX CLASS
  // make controls within each sketch
  var SlideBox = function(sketch, x, y, w, h, fillColor){ // fillColor, initVal) {
    var sketch = sketch;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.bgColor = sketch.colorScheme[0];
    this.fillColor = fillColor;
    this.val = 1.0;
    this.dragging = false;
  }

  var fillPad = 5;

  SlideBox.prototype.draw = function() {
    sketch.stroke(5);
    sketch.fill(this.bgColor);
    sketch.rect(this.x, this.y, this.width, this.height);
    sketch.noStroke();
    sketch.fill(this.fillColor);
    sketch.rect(this.x + fillPad, this.y + this.height + fillPad, this.width - fillPad, - this.height * this.val + fillPad);
  }

  SlideBox.prototype.mouseTouching = function() {
    if (sketch.mouseX > this.x && sketch.mouseX < this.x + this.width) {
      this.val = sketch.map(sketch.mouseY, this.y + this.height, this.y, 0.0, 1.0);
      return true;
    } else {
      return false;
    }
  }

  sketch.slideBoxes = [];

  for ( var i = 0; i< boxCount; i++ ) {
    var fillColor = sketch.colorScheme[( (i + 2) % (sketch.colorScheme.length-2)) + 2];
    // sketch.slideBoxes.push(new SlideBox(sketch, 0, i*sliderHeight/boxCount, sliderWidth, sliderHeight/boxCount, fillColor));
    sketch.slideBoxes.push(new SlideBox(sketch, i*sliderContainerWidth/boxCount, 0, sliderContainerWidth/boxCount, sliderHeight, fillColor));
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
    'durations': new MarkovGenerator(8, 3),
    'deltaTimes': new MarkovGenerator(8, 3),
    'velocities': new MarkovGenerator(8, 3),
    'notes': new MarkovGenerator(8, 3),
    'chords': new MarkovGenerator(8, 3)
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

  // HELPER
  Array.max = function( array ){
      return Math.max.apply( Math, array );
  };
  Array.min = function( array ){
      return Math.min.apply( Math, array );
  };

  sketch.generateNewSequence = function(n) {
    var max = Math.floor(Math.random() * 5) + 1;
    var n = Math.floor(n * 10) + 1;
    console.log(n, max); 
    sketch.markovGens['durations'].reset(n, max);
    sketch.markovGens['deltaTimes'].reset(n, max);
    sketch.markovGens['velocities'].reset(n, max);
    sketch.markovGens['notes'].reset(n, max);

    sketch.markovGens['durations'].feed(channelData.durations);
    sketch.markovGens['deltaTimes'].feed(channelData.deltaTimes);
    sketch.markovGens['velocities'].feed(channelData.velocities);
    sketch.markovGens['notes'].feed(channelData.notes);

    sketch.sequence.durations = sketch.markovGens['durations'].generate();
    sketch.sequence.deltaTimes = sketch.markovGens['deltaTimes'].generate();
    sketch.sequence.velocities = sketch.markovGens['velocities'].generate();
    sketch.sequence.notes = sketch.markovGens['notes'].generate();
    sketch.sequence.chords = sketch.markovGens['chords'].generate();

    // make sure total duration is equal to a multiple of whole note
    sketch.sumOfDeltaTimes  = 0;
    for (var i in sketch.sequence.deltaTimes) {
      sketch.sumOfDeltaTimes += sketch.sequence.deltaTimes[i];
    }
    // if (sketch.sumOfDeltaTimes % 0.5 !== 0) {
    //   sketch.sequence.deltaTimes.push(sketch.sumOfDeltaTimes % 0.5);
    // }

    sketch.minNote = Array.min(sketch.sequence.notes) - 1;
    sketch.maxNote = Array.max(sketch.sequence.notes) + 1;

    // reset position
    sketch.resetPosition();
  }

  sketch.resetPosition = function() {
    sketch.needlePos = 0;
    sketch.beatsSinceLastNote = 0;
    sketch.regenTime = timeElapsed;
  }

  sketch.lightUp = function() {
    alphaValue = 1.0 * sketch.volume;
  }


};



var programChanges = [];

function createChannels(midiInfo) {
  sliderWidth = window.innerWidth - leftBarWidth;
  sliderHeight = (window.innerHeight + transportHeight) / Object.keys(output.header.voices).length;
  var sliderHeightOffset = 0;
  sliderContainerWidth = (window.innerWidth - leftBarWidth) / 5;

  for (var j in output.header.voices) {
    var theDiv = document.getElementById('canvases');
    output.sketches[j] = new p5(sliderSketch, theDiv);

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
