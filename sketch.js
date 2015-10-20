// Constants
var bgIdleColor = 196; // Idle background color
var bgActiveColor = 60;

var mouseDeadzone = 0.5;  
var mouseMax = 40;    
var mouseStep = 3;  

var mSmooth = .5;   // Mouse smoothing
var smoothHigh = .95; // Smoothing factor low-high
var smoothLow = .99;  // Smoothing factor high-low

var noiseAmp = 0.9;  // Noise amplitude
var toneAmp = 1;      // Tone amplitude

var velComponentMax = 30;
var velInherit = 0.5;       // Amount of velocity to inherit

var nodeBaseline = 100; // Lowest radius of a node
var nodeScale = 0.5;   // Scale factor of a node's size

var keyRange = 1;     // Local range of notes
var chordPercent = .75;  // Highest percentage of notes to play as chords

var bpm = 120;        // Beats to play per minute
// C# harmonic minor
var scale;
var chords;

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
noise.setType('white');
noise.amp(0);
noise.start();

// Config

//       C#4  D#4  E4   F#4  G#4  A4   C5   C#5  D#5  E5   F#5  G#5  A5
//        0    1    2    3    4    5    6    7    8    9    10   11   12
scale = [277, 311, 330, 370, 415, 440, 523, 554, 622, 660, 740, 830, 880];
chord = [0, 2, 4];    // Shape of a chord

noStroke();
cursor(HAND);
textSize(14);
textFont('Helvetica');

strokeWeight(3);

// Init
notepX = mouseX;
notepY = mouseY;

hue = random(255);
}

function draw() {
// Clear background
background(lerp(bgIdleColor, bgActiveColor, 1.5 * sq(epsilon / 256)));

// Reset color mode
colorMode(HSB);

// Draw text on top
fill(0, 0, 255, 1 - sq(epsilon/256));
text("Alice Quiros", windowWidth - 100, windowHeight - 20);

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
if (random() * n < chordPercent){
  createChord(note * 4, 1 - sq(1 - epsilon/255));
}else{
createNote(note * 4, 1 - sq(1 - epsilon/255));
}
}

// Noise amplitude
noise.amp(noiseAmp * sq(1 - epsilon/255)); // Max amp of 0.5

// Update nodes
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
for (var i = 1; i < notes.length; i++){
  var n0 = notes[i-1];
  var n1 = notes[i];

  stroke(n0.hue, 50, 128, sq(epsilon/255));

  line(n0.xPos, n0.yPos, n1.xPos, n1.yPos);
}

// Update color
hue = (hue + 0.1) % 255;
}

function mouseClicked(){
  createChord(1000, 1);
}

function createChord(duration, amplitude){
// Get a random root
var root = floor(random(scale.length - chord[chord.length - 1]));

// Create the chord from the root
for (var i = 0; i < chord.length; i++){
  // Find frequency
  var f = scale[root + chord[i]];
  // Cerate new note
  var n = new note(f, duration, mouseX, mouseY);
  // Initialize it
  n.hue = (n.hue + 64 - random(128)) % 255;
  n.start(amplitude);
  // Push to stack
  notes.push(n);
}

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
this.scale = nodeBaseline + nodeScale * (scale[scale.length - 1] - frequency);

this.completed = function(){ return (millis() >= this.end); }
}

// Note initialization method, called once
note.prototype.start = function(amplitude){
  this.env.mult(amplitude);
  this.env.play(this.osc);
}

// Note cleanup method, called once
note.prototype.stop = function(){
  this.osc.stop();
  this.osc.disconnect();

  delete(this.env);
  delete(this.osc);
}

// Main update method, called once per draw
note.prototype.update = function(){
  var p = (this.end - millis()) / this.duration;
  var localScale = this.scale * p * 0.5;

  this.xPos += this.vX;
  this.yPos += this.vY;

// Bounce
if (this.xPos < localScale){ 
  this.xPos = localScale;
  this.vX *= -1;
}else if (this.xPos > windowWidth - localScale){ 
  this.xPos = windowWidth - localScale;
  this.vX *= -1;
}

if (this.yPos < localScale){ 
  this.yPos = localScale;  
  this.vY *= -1;
}else if (this.yPos > windowHeight - localScale){ 
  this.yPos = windowHeight - localScale;
  this.vY *= -1;
}

// Pan sound
var pan = -1 + ((this.xPos - localScale) / (windowWidth - 2 *localScale)) * 2;
if (pan >= 0){
  pan = sqrt(pan);
}else{
  pan = -sqrt(-pan);
}
this.osc.pan(pan);

// Draw sphere
colorMode(HSB);
fill(this.hue, 50, 20 + 200 * p, sq(epsilon/255));
ellipse(this.xPos, this.yPos, localScale * 2, localScale * 2);
}