var bpm = 90;
var current = 0;
// drums
var kick = new Tone.Sampler('audio/kick.mp3');
var snare = new Tone.Sampler('audio/snare.mp3');
var hh = new Tone.Sampler('audio/hh.mp3');
var hho =new Tone.Sampler('audio/agogoHigh.mp3');
var drumArray = [kick, snare, hh, hho];
for (var i in drumArray) {
  drumArray[i].toMaster();
}

var socket = io();

socket.on('initSequencer', function(data) {
  parseSeqObj(data);
  console.log(data);
});

// how many blocks fit horizontally and vertically:
var hDiv = drumArray.length;
var wDiv = 16;

// array of Blocks
var blocks = [];

// ===========================
// Drum Pattern Array for i/o
// ===========================
var kickArray = new Array(wDiv);
var snareArray = new Array(wDiv);
var hhArray = new Array(wDiv);
var hhoArray = new Array(wDiv);
var drumPatterns = [kickArray, snareArray, hhArray, hhoArray];

// set all the drums to 0 empty to start
function clearBlocks() {
  for (var i in drumPatterns) {
    for (var j = 0; j < wDiv; j++) {
      drumPatterns[i][j] = false;
    }
  }
  blocks = [];
}

function parseSeqObj(data) {
  console.log(data);
  clearBlocks();
  drumPatterns = data;
  for (var i in drumPatterns) {
    console.log('doin it');
    for (var j = 0; j < wDiv; j++) {
      if (drumPatterns[i][j] === true) {
        var bX = width/wDiv * j;
        var bY = height/hDiv * i; // reverse?
        blocks.push( new Block(bX, bY));
      };
    }
  }
}

function savePattern() {
  saveJSON(drumPatterns, 'myPattern.json');
}

function setup() {
  createCanvas(800, 400);

  // set up tone transport
  Tone.Transport.setInterval(function(time){
    increment(time);
  }, "16n");
  Tone.Transport.start();
  Tone.Transport.setBpm(bpm);

  // ============ 
  // UI w/ p5.dom
  // ============
  createP('');
  var volumeSlider = createSlider();
  var vol = createP('Volume');
  volumeSlider.mouseMoved( function() {
    Tone.Master.setVolume( map(volumeSlider.value(), 0, 100, -80, 1));
  });
  volumeSlider.value(100);

  var clear = createButton('clear');
  clear.mousePressed( function() {
    clearBlocks();
  });
  var save = createButton('save');
  save.mousePressed( function() {
    savePattern();
  });

  var tempoSlider = createSlider();
  tempoSlider.mouseMoved( function() {
    Tone.Transport.setBpm( map(tempoSlider.value(), 0, 100, 40, 200));
  });
  tempoSlider.value(map(bpm, 40, 200, 0, 100));


  // ==================
  // Import Saved Files
  // ==================
  var dropZone = createDiv('Drop files here');
  dropZone.id('drop_zone');
  // Add some events
  dropZone.elt.addEventListener('dragover', handleDragOver, false);
  dropZone.elt.addEventListener('drop', handleFileSelect, false);
  dropZone.elt.addEventListener('dragleave', handleDragLeave, false);
  
  // When you drag a file on top
  function handleDragOver(evt) {
    // Stop the default browser behavior
    evt.stopPropagation();
    evt.preventDefault();
    dropZone.style('background','#fff000');
  }
  
  // If the mosue leaves
  function handleDragLeave(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    dropZone.style('background','#fff');
  }
  
  // If you drop the file
  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    dropZone.style('background','');

    // A FileList
    var files = evt.dataTransfer.files;
    // Show some properties
    for (var i = 0, f; f = files[i]; i++) {
      // Read the file and process the result
      var reader = new FileReader();
      reader.readAsText(f);
      reader.onload = function(e) {
        parseSeqObj(JSON.parse(e.target.result));
        sendDrumPattern();
      }
    }
  }
} // end setup

// ========================
// keep time and play drums
// ========================
var step = 0;
function increment(time) {
  step++;
  for (var i in blocks) {
    var stepColumn = map( (step%wDiv), 0, wDiv, 0, width);
    if (blocks[i].x === stepColumn) {
      var whichDrum = Math.round( map(blocks[i].y, 0, height, hDiv, 0) ) - 1;
      playDrum(whichDrum, time);
      blocks[i].c[1] = 0;
      blocks[i].c[2] = 0;
    }
  }
}

function playDrum(whichDrum, time) {
  drumArray[whichDrum].triggerAttackRelease(1, time);
  current++;
}

// ==========================
// draw and mouse interaction
// ==========================
function draw() {
  background(0);

  // draw four boxes
  fill(20);
  rect(0, 0, width/4, height);
  fill(40);
  rect(width/4, 0, width/4, height);
  fill(20);
  rect(width/4 * 2, 0, width/4, height);
  fill(40);
  rect(width/4 * 3, 0, width/4, height);

  for (var i in blocks) {
    blocks[i].update();
  }
}

var pressedX, pressedY;
function mousePressed() {
  // if it is touching a preexisting block, remove that block
  pressedX = null;
  pressedY = null;
  for (var i in blocks) {
    if (blocks[i].isTouching(mouseX, mouseY) ) {
      pressedX = blocks[i].x;
      pressedY = blocks[i].y;
      blocks[i].remove();
      blocks.splice(i, 1);
    }
  }
}

function mouseDragged() {
  var halfBlockWidth = width/wDiv/2;
  var halfBlockHeight = height/hDiv/2;

  pressedX = null;
  pressedY = null;
  rect(mouseX - halfBlockWidth, mouseY - halfBlockHeight, width/wDiv, height/hDiv);
}

function mouseReleased() {
  // map block position to grid

  var halfBlockWidth = width/wDiv/2;
  var halfBlockHeight = height/hDiv/2;
  var bX = Math.round(map(mouseX - halfBlockWidth, 0, width, 0, wDiv))/wDiv * width;
  var bY = Math.round(map(mouseY - halfBlockHeight, 0, height, 0, hDiv))/hDiv * height;
  // do not re-add block if mouse is in same place
  if (bX === pressedX && bY === pressedY) {
    return;
  }
  if (pressedX !== null && Math.abs(pmouseX - mouseX) < 3 && Math.abs(pmouseY - mouseY) < 3) {
    return;
  }
  // only add block if mouse is within width/height of canvas
  if (bX < width && bX >= 0 && bY < height && bY >= 0) {
    blocks.push( new Block(bX, bY));
  }

  // update socket.io
  sendDrumPattern();
}

// ============
// Block class
// ============
var Block = function(x, y) {
  this.x = x;
  this.y = y;
  this.w = width/wDiv;
  this.h = height/hDiv;
  this.c = [255, 255, 255];

  // update drumPattern array
  var whichDrum = drumArray.length - Math.round( map(this.y, 0, height, hDiv, 0) );
  var whichStep = Math.round(map(this.x, 0, width, 0, wDiv));
  drumPatterns[whichDrum][whichStep] = true;
}

Block.prototype.update = function() {
  this.c[2] += 20;
  this.c[1] += 20;
  fill(this.c);
  rect(this.x, this.y, this.w, this.h);
}

Block.prototype.isTouching = function(x, y) {
  if ( (this.x <= x) &&  (x <= (this.x + this.w) ) && (this.y <= y) && (y <= (this.y + this.h) ) ) {
    return true;
  }
  else {
    return false;
  }
}

Block.prototype.remove = function() {
  // update drumPattern array to zero
  var whichDrum = drumArray.length - Math.round( map(this.y, 0, height, hDiv, 0) );
  var whichStep = Math.round(map(this.x, 0, width, 0, wDiv));
  drumPatterns[whichDrum][whichStep] = null;

  // update socket.io
  sendDrumPattern();
}

// ============
// SOCKET STUFF
// ============
function sendDrumPattern() {
  socket.emit('changedPattern', drumPatterns);
}

socket.on('updateSeq', function (data) {
  console.log(data);
  parseSeqObj(data);
});