function setup() {
  loadJSON('keymap.json', registerKeymap);
  scale = major;
  root = 48;
  isChords = false;
}

var pressedKeys = [];

window.onkeydown = function (e) {
  for (var k in myKeymap) {
    if (myKeymap[k].keyCode === e.keyCode) {
      myKeymap[k].playing = true;
      pressedKeys.push(myKeymap[k].keyCode);
      // isPlaying = true;
      if (myKeymap[k].note > 20) {
        // logKeyDown(myKeymap[k].keyCode, myKeymap[k].note);
        synth.triggerAttack( midiToFreq(myKeymap[k].note) );
      }
      return;
    }
  }
}

window.onkeyup = function(e) {
  // depress the key
  for (var k in pressedKeys) {
    if (e.keyCode === pressedKeys[k]) {
      pressedKeys.splice(k, 1);
      myKeymap[k].playing = false;
      continue;
    }
  }
  if (pressedKeys.length > 0) {
    synth.setFreq(midiToFreq(myKeymap[pressedKeys[length-1]]));
  } else {
    synth.triggerRelease();
  }
}
