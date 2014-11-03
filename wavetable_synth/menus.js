// var takesMenu;

// function setupTakesMenu() {
//   // Frontend Menu of takes
//   takesMenu = document.createElement('SELECT');
//   takesMenu.id = 'takesMenu';
//   var option = document.createElement('option');
//   option.text = 'Select Your Take to Play Back';
//   takesMenu.add(option);
//   takesMenu.onchange = function(e) {takeSelected(e)};
//   document.body.appendChild(takesMenu);
// }

var presetMenu;

window.onload = function() { 
  setupPresetMenu();
  console.log('loaded');
}

function setupPresetMenu() {
  presetMenu = document.createElement('SELECT');
  presetMenu.id = 'presetMenu';
  for (var i in presets) {
    var option = document.createElement('option');
    option.text = i;
    presetMenu.add(option);
    presetMenu.onchange = function(e) {presetSelected(e)};
    document.body.appendChild(presetMenu);
  }
}

function presetSelected(preset) {
  var selectedValue = presetMenu.options[presetMenu.selectedIndex].value;
  synth.triggerRelease();
  synth.setPreset(selectedValue);
}