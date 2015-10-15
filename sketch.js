// Constants
var bgIdleColor = 196; // Idle background color
var bgActiveColor = 15;

var mouseDeadzone = 0.5;  
var mouseMax = 40;    
var mouseStep = 3;  

var mSmooth = .5;   // Mouse smoothing
var smoothHigh = .9; // Smoothing factor low-high
var smoothLow = .99;  // Smoothing factor high-low

var noiseAmp = 0.75;  // Noise amplitude
var toneAmp = 1;      // Tone amplitude

var velComponentMax = 30;
var velInherit = 0.5;       // Amount of velocity to inherit
 
var nodeBaseline = 100; // Lowest radius of a node
var nodeScale = 0.35;   // Scale factor of a node's size

var keyRange = 1;     // Local range of notes

var bpm = 120;        // Beats to play per minute
// C# harmonic minor
var scale;

// Color

// ------------------------------
// End of constants
// ------------------------------

// Notes
var noise;  // Noise generator

// Input
var notepX = 0;
var notepY = 0;
var noteDx = 0;
var noteDy = 0;

var mouseDx = 0;
var mouseDy = 0;
var epsilon = 0; 

// Note timing
var mNext = 0; 

// List of nodes
var notes = [];

// Color
var hue;


function setup() {
// Create canvas
  createCanvas(windowWidth, windowHeight);
  background(bgIdleColor);
// Create noise
noise = new p5.Noise();
noise.setType('pink');
noise.amp(0);
noise.start();

scale = [277, 311, 330, 370, 415, 440, 523, 554, 622, 660, 740, 830];

notepX = mouseX;
notepY = mouseY;

hue = random(255);
}

function draw() {
  // Clear background
  background(lerp(bgIdleColor, bgActiveColor, 1.5 * sq(epsilon / 255)));

  mouseDx = lerp(mouseDx, mouseX - pmouseX, mSmooth);
  mouseDy = lerp(mouseDy, mouseY - pmouseY, mSmooth);

  // Delta mouse
  dMouse = sqrt(sq(mouseDx) + sq(mouseDy));

  // Epsilon calculations
  var eNew = dMouse * 256 / mouseMax;
  if (eNew >= epsilon){
    epsilon = constrain(lerp(eNew, epsilon, smoothHigh), 0, 255);
  }else{
    epsilon = constrain(lerp(eNew, epsilon, smoothLow), 0, 255);
  }

  var mouseVel = mag(mouseDx, mouseDy);
  if (mouseVel > mouseDeadzone && millis() >= mNext){
    // Calculate time until next note
    var beat = 60000 / bpm;
    var n = floor(constrain(mouseVel, 0, mouseMax) / mouseMax * mouseStep);
    var note = 2 * beat / pow(2, n);

    mNext = millis() + note;

    // Create note
    createNote(note * 4, 1 - sq(1 - epsilon/255));
  }

  // Noise amplitude
  noise.amp(noiseAmp * sq(1 - epsilon/255)); // Max amp of 0.5

  // Update nodes
  noStroke();
  for (var i = 0; i < notes.length; i++){
    if (notes[i].completed()){
      // Delete note
      var n = notes.shift();
      n.stop();

     delete(n);
      i--;
    }else{
      // Update note
      notes[i].update();
    }
  }

  // Draw line between remaining nodes
  colorMode(HSB);
  strokeWeight(2);
  for (var i = 1; i < notes.length; i++){
    var n0 = notes[i-1];
    var n1 = notes[i];

    stroke(n0.hue, 50, 128);

    line(n0.xPos, n0.yPos, n1.xPos, n1.yPos);
  }

  // Update color
  hue = (hue + 0.1) % 255;
}

function mouseClicked(){
  createNote(1000, 1);
}

function createNote(duration, amplitude){
  // Create new note
  var f = scale[floor(random(scale.length))];
  var n = new note(f, duration, mouseX, mouseY);

  // Initialize it
  n.start(amplitude);
  // Push to stack
  notes.push(n);
}

function note(frequency, duration, x, y){
  // Update globals
  noteDx = lerp(noteDx, mouseX - notepX, mSmooth);
  noteDy = lerp(noteDy, mouseY - notepY, mSmooth);
  notepX = x;
  notepY = y;

  // Create oscilator and envelope
  this.env = new p5.Env(0.005, 1, 0.1, 0.7, duration / 2000, 0.3, 0.1);
  this.osc = new p5.Oscillator(frequency, 'triangle');
  this.osc.amp(this.env);
  this.osc.start();

  // Set variables
  this.vX = constrain(mouseDx * velInherit, -velComponentMax, velComponentMax);
  this.vY = constrain(mouseDy * velInherit, -velComponentMax, velComponentMax);

  this.xPos = x;
  this.yPos = y;

  this.duration = duration;
  this.end = millis() + duration;

  this.hue = floor(hue);

  this.frequency = frequency;

  this.completed = function(){ return (millis() >= this.end); }
}

note.prototype.start = function(amplitude){
  this.env.mult(amplitude);
  this.env.play(this.osc);
}

note.prototype.stop = function(){
  this.osc.stop();
  this.osc.disconnect();

  console.log("stop");

  delete(this.env);
  delete(this.osc);
}

note.prototype.update = function(){
  var p = (this.end - millis()) / this.duration;

  this.xPos += this.vX;
  this.yPos += this.vY;

  if (this.xPos < 0){ 
    this.xPos = 0;
    this.vX *= -1;
  }else if (this.xPos > windowWidth){ 
    this.xPos = windowWidth;
    this.vX *= -1;
  }

  if (this.yPos < 0){ 
    this.yPos = 0;
    this.vY *= -1;
  }else if (this.yPos > windowHeight){ 
    this.yPos = windowHeight;
    this.vY *= -1;
  }

  var m = nodeBaseline + nodeScale * (this.frequency - scale[0]);

  colorMode(HSB);
  fill(this.hue, 50, 40 + 160 * p, sq(epsilon/255));
  ellipse(this.xPos, this.yPos, m * p, m * p);
}