// adapted from Daniel Shiffman and Allison Parrish
// https://github.com/aparrish/rwet-examples

// returns random element from a list a la Python
function choice(somelist) {
  var i = Math.floor(Math.random(somelist.length));
  return somelist[i];
}

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return obj[result][0];
}

function MarkovGenerator(n, max) {
  this.n = n;
  this.max = max;

  this.ngrams = {};

  this.beginnings = [];
}

// where score is some kind of array
MarkovGenerator.prototype.feed = function(score) {
  // var beginning = score[0];
  var beginning = this.parseGram(0, score);
  this.beginnings.push(beginning);

  for (var i = 0; i < score.length - this.n; i++) {
    var gram = this.parseGram(i, score);
    var next = this.parseGram(i + this.n, score);

    // is this a new one?
    if (!this.ngrams.hasOwnProperty(gram)) {
      this.ngrams[gram] = [];
    }

    // add to the list
    this.ngrams[gram].push(next);
  }
}

MarkovGenerator.prototype.reset = function(n, max) {
  this.ngrams = {};
  this.beginnings = [];
  var n = n || this.n;
  var max = max || this.max;
  this.n = n;
  this.max = max;
}

// helper function to return a slice of n-length at a position in a score
MarkovGenerator.prototype.parseGram = function(position, score) {
  var gram = [];
  for (var i = position; i < position + this.n; i++) {
    gram.push(score[i]);
  }
  return gram;
}

// generate a score from ngrams
MarkovGenerator.prototype.generate = function(startingPoint) {

  var current = choice(this.beginnings);
  if (startingPoint) {
    current = pickRandomProperty(this.ngrams);
  }
  var output = [];
  for (var c in current) {
    output.push(current[c]);
  }

  // generate a new token max number of times
  for (var i = 0; i < this.max; i++) {
    // if this is a valid ngram
    if (this.ngrams.hasOwnProperty(current)) {
      // what are all the possible next tokens
      var possibleNext = this.ngrams[current];
      // pick one randomly
      var next = choice(possibleNext);
      // add to output
      for (var n in next) {
        output.push(next[n]);
      }

      // get the last n entries of the output, which will be used
      // to look up an ngram in the next iteration of the loop
      current = this.parseGram(output.length - 1 - this.n, output);
    } else {
      break;
    }
  }
  return output;
}

