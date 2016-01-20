/* CONFIGURATION */
var particleSize = 32;
var particleSpeed = 200;
var particleColor1 = 'hsb(160, 100%, 50%)';
var particleColor2 = 'hsb(160, 100%, 50%)';

/* ADVANCED */
var keymap = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', 'º'];

/* GLOBALS */
var synth;
var octave = 4;
var lmillis;
var deltaTime = 0;
var particles = [];

function droplet(xpos, speed, size, fillcolor) {
	this.speed = speed;
	this.radius = size;
	this.xpos = xpos;
	this.ypos = windowHeight + size;
	this.c = fillcolor;

	this.draw = function() {
		this.ypos -= this.speed * deltaTime;
s
		fill(this.c);
		ellipse(this.xpos, this.ypos, this.radius, this.radius);
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	Synthesizer.initialize(12, 'sine');
	lmillis = millis();

	particleColor1 = color(particleColor1);
	particleColor2 = color(particleColor2);

	colorMode(HSB);
	smooth();
	noStroke();
}

function draw() {
	background(20);

	var m = millis();
	deltaTime = (m - lmillis) / 1000;
	lmillis = m;

	for (var i = 0; i < particles.length; i++) {
		particles[i].draw();

		// Remove any particles outside bounds
		if (particles[i].y <= -particles[i].size) {
			particles.splice(i, 1);
		}
	}
}

function handleKey(key) {
	switch (key.toLowerCase()) {
		case 'z':
			octave = constrain(octave - 1, 2, 7);
			break;
		case 'x':
			octave = constrain(octave + 1, 2, 7);
			break;
		case 'c':
			Synthesizer.stopAll();
			break;
	}
}

function keyPressed() {
	var offset = keymap.indexOf(key.toLowerCase());
	if (offset >= 0) {
		if (Synthesizer.startNote(12 + 12 * octave + offset)) {

			// Create a new particle
			var dx = (offset + 1) / (keymap.length + 1);
			var c = lerpColor(particleColor1, particleColor2);
			console.log(c);
			var p = new droplet(dx * windowWidth, particleSpeed, particleSize, c);
			particles.push(p);
		}
	} else {
		handleKey(key.toLowerCase());
	}

	return false;
}

function keyReleased() {
	var offset = keymap.indexOf(key.toLowerCase());
	if (offset >= 0) {
		Synthesizer.stopNote(12 + 12 * octave + offset);
	}

	return false;
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}