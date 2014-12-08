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
var sliderWidth = 250;
var sliderHeight = 800;

/**
 *  SLIDER SKETCH TEMPLATE
 */
var sliderSketch = function(sketch) {
  var dragging = false;
  var slidePos = sketch.height - 30;

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

};


function createChannels(midiInfo) {
  sliderWidth = window.innerWidth / Object.keys(output.header.voices).length;
  sliderHeight = window.innerHeight ;

  for (var j in output.header.voices) {
    console.log(output.header.voices[j]['program']);
    output.sketches[j] = new p5(sliderSketch);

    // assign midi voice
      MIDI.channels[j].instrument = output.header.voices[j]['program'];

    // MIDI.programChange(j, output.header.voices[j]['program']);
  }
}

