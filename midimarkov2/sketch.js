var mySong;

function setup() {
  loadJSON('../midifiles/stevie_wonder-superstition.mid.json', logSong);
}

function logSong(variable) {
  mySong = variable;
  console.log('bang');
  // console.log(mySong.length);
}