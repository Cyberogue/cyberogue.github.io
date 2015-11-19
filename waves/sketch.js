/* ###### CONFIG ###### */
var period = 1000;
var amp = 250;
var base = 10;

var sFreq = 2000;

var hueRate = 180;

/* ###### ADVANCED ##### */
var debug = true;
var debugClr = true;

var mSmooth = .3;

/* ###### GLOBALS ###### */
var pdY, pdX, dY, dX, aX, aY, dT, m;
var hue = 0;
var reader;

/* ##### MAIN CODE ##### */

function onDraw() { // Called 60 times a second
	colorMode(RGB);
	stroke(0, 0, 0, 0);
	fill(0, 0, 0, 127 * dT);
	rect(0, 0, windowWidth, windowHeight);

	colorMode(HSB);
	hue = (hue + 10 - random(20)) % 360;
	stroke(hue, 200, 127);
	//fill(hue, 200, 127);
}

function drawChunk(count) {
	// Clamp count to be safe
	if (count > 1000) count = 1000;
	else if (count < 1) count = 1;

	if (sq(dX) + sq(dY) <= 0.01) return;

	console.log("Draw " + count);

	// Continue
	var n1 = new Array(count);
	var n2 = new Array(count);

	var mStart = m - dT * 1000;
	for (var i = 0; i <= count; i++) {
		var l = i / (count - 1);
		var lcos = sin(l * PI / 2);
		var tsim = mStart + (i / count * dT * 1000);

		var a = base + amp / 4 * (1 + cos((tsim % period) / period * TWO_PI));

		var dir = new Vector2(lerp(pdX, dX, lcos), lerp(pdY, dY, lcos));
		dir.normalize();

		var center = new Vector2(lerp(pmouseX, mouseX, l), lerp(pmouseY, mouseY, l));

		n1[i] = new Vector2(center.x + a * dir.y, center.y - a * dir.x);
		n2[i] = new Vector2(center.x - a * dir.y, center.y + a * dir.x);
	}

	colorMode(HSB);
	var c1 = color(hue, 200, 127);
	var c2 = color((hue + hueRate * dT) % 360, 200, 127);

	// Draw quads
	for (var i = 1; i <= count; i++) {
		var c = lerpColor(c1, c2, (i - 1) / (count - 1));

		fill(c, 200, 127);
		quad(n1[i - 1].x, n1[i - 1].y, n2[i - 1].x, n2[i - 1].y, n2[i].x, n2[i].y, n1[i].x, n1[i].y);
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

	colorMode(HSB);

	angleMode(RADIANS);

	smooth();
}

var _ts = 0;
var ct = 0;

function draw() {
	if (debugClr) console.clear();

	updateGlobals();
	onDraw();

	// Calculate rays to draw
	_ts += dT;
	var _cts = floor(_ts * sFreq);
	_ts -= _cts / sFreq;

	if (abs(dX) > 1 || abs(dY) > 1) {
		drawChunk(_cts);
	}

	ct += _cts;

	if (debug) onDebug();
}

function updateGlobals() {
	pdY = dY;
	pdX = dX;
	dY = (1 - mSmooth) * (mouseY - pmouseY) + mSmooth * dY;
	dX = (1 - mSmooth) * (mouseX - pmouseX) + mSmooth * dX;
	dT = (millis() - m) / 1000;
	aX = dX - pdX;
	aY = dY - pdY;
	m = millis();

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

var periodLabel, ampLabel, baseLabel, sampleLabel;
var periodSlider, ampSlider, baseSlider, sampleSlider;
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
}

/* ####### DEBUG ####### */

function onDebug() {
	console.log('period:' + period + '\namp:' + amp + '\nbase:' + base + '\nsample:' + sFreq);
	console.log("dY:" + round(dY * 10) / 10 + "\tdX:" + round(dX * 10) / 10 + "\ndT:" + round(dT * 10000) / 10000 + "\nHue:" + round(hue));
}