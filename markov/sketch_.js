var sampleInput = [64, 62, 60, 62, 64, 67];

var markov;

function setup() {
  print(analyzeFrequency(sampleInput));
}


// returns a markov chain based on the sequence
function analyzeFrequency(input) {

  var obj = {};

  for (var i = 0; i < input.length; i++) {
    if (obj[input[i]]) {
      obj[input[i]]++;
    }
    else {
      obj[input[i]] = 1;
    }
  }

  return obj;
}