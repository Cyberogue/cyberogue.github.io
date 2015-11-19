/* ###### CONFIG ###### */
var period = 1000;
var amp = 250;
var base = 10;

var sFreq = 2000;

var hueRate = 180;

var mode = 0;

/* ###### ADVANCED ##### */
var debug = true;
var debugClr = true;

var mSmooth = 1;

/* ###### GLOBALS ###### */
var pdY, pdX, dY, dX, aX, aY, dT, m;
var hue = 0;
var reader;

var pause = false;

/* ##### MAIN CODE ##### */

function onDraw() { // Called 60 times a second
	colorMode(RGB);
	noStroke();
	fill(0, 0, 0, 127 * dT);
	rect(0, 0, windowWidth, windowHeight);

	colorMode(HSB);
	hue = (hue + 10 - random(20)) % 360;
	stroke(hue, 200, 127);
	//fill(hue, 200, 127);
}

function drawChunk(count) {
	// Clamp count to be safe
	console.log("Draw " + count);

	// Continue
	var n1 = new Array(count);
	var n2 = new Array(count);

	var mStart = m - dT * 1000;
	for (var i = 0; i <= count; i++) {
		var l = i / (count - 1);
		var lcos = sin(l * PI / 2);
		var tsim = mStart + (i / count * dT * 1000);

		var a = base + amp / 4 * (1 + envelope((tsim % period) / period * TWO_PI));

		var dir = new Vector2(lerp(pdX, dX, lcos), lerp(pdY, dY, lcos));
		dir.normalize();

		var center = new Vector2(lerp(pmouseX, mouseX, l), lerp(pmouseY, mouseY, l));
		center.x += aX * dT;
		center.y += aY * dT;

		n1[i] = new Vector2(center.x + a * dir.y, center.y - a * dir.x);
		n2[i] = new Vector2(center.x - a * dir.y, center.y + a * dir.x);
	}

	//colorMode(HSB);
	//fill(hue, 200, 127);
	// Draw quads
	for (var i = 1; i <= count; i++) {
		quad(n1[i - 1].x, n1[i - 1].y, n2[i - 1].x, n2[i - 1].y, n2[i].x, n2[i].y, n1[i].x, n1[i].y);
	}
}

function envelope(t) { // t goes from 0 to TWO_PI
	switch (mode) {
		case 0: // sine
		default:
			return cos(t);
			break;
		case 1: // Tan
			return tan(t) / 2; // Prevent infinite
			break;
		case 2: // square
			return t <= PI ? 1 : -1;
			break;
		case 3: // triangle
			return t <= PI ? -1 + t / HALF_PI : 1 - (t - PI) / HALF_PI;
			break;
		case 4: // saw
			return -1 + t / PI;
			break;
		case 5: // invsaw
			return 1 - t / PI;
			break;
		case 6: // random
			return random(-1, 1);
			break;
	}
}

/* ##################### */

function setup() {
	// Create window
	createCanvas(windowWidth, windowHeight);
	background(20);

	createDom();

	dY = 0;
	dX = 0;
	dT = 0;
	hue = 0;
	m = millis();

	__x = mouseX;
	__y = mouseY;

	colorMode(HSB);

	angleMode(RADIANS);

	smooth();
}

var _ts = 0;
var ct = 0;

function draw() {
	if (debugClr) console.clear();

	updateGlobals();

	if (keyIsDown(SHIFT)) return;

	onDraw();

	// Calculate rays to draw
	_ts += dT;
	var _cts = floor(_ts * sFreq);
	_ts -= _cts / sFreq;

	_cts = constrain(_cts, 0, 1000);

	if (sq(dX) + sq(dY) >= dT * dT) drawChunk(_cts);

	ct += _cts;

	if (debug) onDebug();
}


var __x, __y;

function updateGlobals() {
	pdY = dY;
	dT = (millis() - m) / 1000;
	pdX = dX;

	var __ms = mSmooth * dT;
	dY = (1 - __ms) * (mouseY - __y) + __ms * dY;
	dX = (1 - __ms) * (mouseX - __x) + __ms * dX;
	aX = dX - pdX;
	aY = dY - pdY;
	m = millis();

	__x = mouseX;
	__y = mouseY;

	hue = (hue + hueRate * dT) % 360;
}

/* ####### UTIL ######## */
function Vector2(x, y) {
	this.x = x;
	this.y = y;

	this.normalize = function() {
		if (this.x == 0 && this.y == 0) {
			return;
		}
		var m = this.magnitude();
		this.x /= m;
		this.y /= m;
	}

	this.magnitude = function() {
		return sqrt((x * x) + (y * y));
	}
}

/* ####### DOM ######### */

var periodLabel, ampLabel, baseLabel, sampleLabel, pauseLabel;
var periodSlider, ampSlider, baseSlider, sampleSlider;
var clearButton, saveButton;
var modeSelect;
var fpAdj = 300;

function createDom() {
	var sliderWidth;
	if (windowWidth * .075 < 100) sliderWidth = '100px';
	else sliderWidth = '7.5%';

	periodSlider = createSlider(fpAdj * log(10), fpAdj * log(10000), fpAdj * log(1000));
	periodSlider.position(75, 25);
	periodSlider.style('width', sliderWidth);
	periodSlider.changed(refreshVars);

	ampSlider = createSlider(0, 400, 250);
	ampSlider.position(75, 50);
	ampSlider.style('width', sliderWidth);
	ampSlider.changed(refreshVars);

	baseSlider = createSlider(0, 100, 10);
	baseSlider.position(75, 75);
	baseSlider.style('width', sliderWidth);
	baseSlider.changed(refreshVars);

	sampleSlider = createSlider(fpAdj * log(120), fpAdj * log(2000), fpAdj * log(1000));
	sampleSlider.position(75, 100);
	sampleSlider.style('width', sliderWidth);
	sampleSlider.changed(refreshVars);

	periodLabel = createSpan('');
	periodLabel.position(25, 25);
	periodLabel.style('font-size', 12);
	periodLabel.style('font-family', 'sans-serif');
	periodLabel.style('color', 'silver');

	ampLabel = createSpan('');
	ampLabel.position(25, 50);
	ampLabel.style('font-size', 12);
	ampLabel.style('font-family', 'sans-serif');
	ampLabel.style('color', 'silver');

	baseLabel = createSpan('');
	baseLabel.position(25, 75);
	baseLabel.style('font-size', 12);
	baseLabel.style('font-family', 'sans-serif');
	baseLabel.style('color', 'silver');

	sampleLabel = createSpan('');
	sampleLabel.position(25, 100);
	sampleLabel.style('font-size', 12);
	sampleLabel.style('font-family', 'sans-serif');
	sampleLabel.style('color', 'silver');

	pauseLabel = createSpan('Hold [SHIFT] to pause');
	pauseLabel.position(25, 155);
	pauseLabel.style('font-size', 12);
	pauseLabel.style('font-family', 'sans-serif');
	pauseLabel.style('color', 'grey');

	clearButton = createButton('Clear');
	clearButton.position(25, 125);
	clearButton.style('width', '40px');
	clearButton.style('height', '20px');
	clearButton.style('background', '#222');
	clearButton.style('color', 'silver');
	clearButton.mouseClicked(clearCanvas);

	saveButton = createButton('Save');
	saveButton.position(65, 125);
	saveButton.style('width', '40px');
	saveButton.style('height', '20px');
	saveButton.style('background', '#666');
	saveButton.style('color', 'silver');
	saveButton.mouseClicked(saveImage);

	modeSelect = createSelect();
	modeSelect.position(105, 125);
	modeSelect.option('Sine');
	modeSelect.option('Tan');
	modeSelect.option('Square');
	modeSelect.option('Triangle');
	modeSelect.option('Saw');
	modeSelect.option('InvSaw');
	modeSelect.option('Random');
	modeSelect.style('width', '70px');
	modeSelect.style('height', '20px');
	modeSelect.style('background', '#666');
	modeSelect.style('color', 'silver');
	modeSelect.changed(refreshVars);

	refreshVars();
}

function refreshVars() {
	period = exp(periodSlider.value() / fpAdj);
	amp = ampSlider.value();
	base = baseSlider.value();
	sFreq = exp(sampleSlider.value() / fpAdj);

	periodLabel.html('P: ' + round(period));
	ampLabel.html('A: ' + round(amp));
	baseLabel.html('B: ' + round(base));
	sampleLabel.html('Fs: ' + round(sFreq));

	switch (modeSelect.value().toLowerCase()) {
		case 'sine':
		default:
			mode = 0;
			break;
		case 'tan':
			mode = 1
			break;
		case 'square':
			mode = 2;
			break;
		case 'triangle':
			mode = 3;
			break;
		case 'saw':
			mode = 4;
			break;
		case 'invsaw':
			mode = 5;
			break;
		case 'random':
			mode = 6;
			break;
	}
}

function clearCanvas() {
	background(10);
}

function saveImage() {
	saveImage('waveform_drawing', 'png');
}

/* ####### DEBUG ####### */

function onDebug() {
	console.log('period:' + period + '\namp:' + amp + '\nbase:' + base + '\nsample:' + sFreq);
	console.log("dY:" + round(dY * 10) / 10 + "\tdX:" + round(dX * 10) / 10 + "\ndT:" + round(dT * 10000) / 10000 + "\nHue:" + round(hue));
}