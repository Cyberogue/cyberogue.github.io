/* ###### CONFIG ###### */
var period = 1000;
var amp = 250;
var base = 10;

var sFreq = 1000;

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

function onDraw(){	// Called 60 times a second
	colorMode(RGB);
	stroke(0,0,0,0);
	fill(0, 0, 0, 127 * dT);
	rect(0, 0, windowWidth, windowHeight);

	colorMode(HSB);
	hue = (hue + 10 - random(20)) % 360;
	stroke(hue, 200, 127);
	fill(hue, 200, 127);
}

function rayDraw(x, y, t, l){	// Called sFreq times a second
	var a = base + amp/4 * (1 + cos((t % period) * PI / 180));
	var ray = new Vector2(dX, dY);
	ray.x *= -1;
	ray.normalize();

	line(x + ray.y * a, y + ray.x * a, x - ray.y * a, y - ray.x * a);
}

function drawChunk(count){
	console.log("Draw " + count);

	var n1 = new Array(count);
	var n2 = new Array(count);

	var mStart = m - dT * 1000;
	for (var i = 0; i <= count; i++){
		var l = i / (count - 1);		
		var tsim = mStart + (i / count * dT * 1000);

		var a = base + amp/4 * (1 + cos(tsim % period * PI/180));

		var dir = new Vector2(lerp(pdX, dX, l), lerp(pdY, dY, l));
		dir.normalize();

		var center = new Vector2(lerp(pmouseX, mouseX, l), lerp(pmouseY, mouseY, l));

		n1[i] = new Vector2(center.x + a * dir.y, center.y - a * dir.x);
		n2[i] = new Vector2(center.x - a * dir.y, center.y + a * dir.x);
	}

	// Draw quads
	for (var i = 1; i <= count; i++){
		quad(n1[i-1].x, n1[i-1].y, n2[i-1].x, n2[i-1].y, n2[i].x, n2[i].y, n1[i].x, n1[i].y);
	}
}

/* ##################### */

function setup() {
	// Create window
	createCanvas(windowWidth, windowHeight);
	background(20);

	dY = 0; dX = 0; dT = 0;
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

	if (abs(dX) > 1 || abs(dY) > 1){
		drawChunk(_cts);
	}

	// Draw rays
	/*
	if (abs(dX) > 1 || abs(dY) > 1){
		if (debug) console.log("Render " + _cts);
		for (var i = 0; i < _cts; i++){
			var _t = i / (_cts-1);
			rayDraw(lerp(pmouseX, mouseX, _t), lerp(pmouseY, mouseY, _t), m - ((1 - i / _cts) * dT * 1000), _t);
		}
	}else if (debug){
		console.log("Render None");
	}*/

	ct += _cts;
	
	if (debug) onDebug();
}

function updateGlobals(){
	pdY = dY; pdX = dX;
	dY = (1 - mSmooth) * (mouseY - pmouseY) + mSmooth * dY;
	dX = (1 - mSmooth) * (mouseX - pmouseX) + mSmooth * dX;
	dT = (millis() - m) / 1000;
	aX = dX - pdX;
	aY = dY - pdY;
	m = millis();

	hue = (hue + hueRate * dT) % 360;
}

/* ####### UTIL ######## */
function Vector2(x, y){
	this.x = x;
	this.y = y;

	this.normalize = function(){
		if (this.x == 0 && this.y == 0){ return; }
		var m = this.magnitude();
		this.x /= m; this.y /= m;
	}

	this.magnitude = function(){
		return sqrt((x*x) + (y*y));
	}
}

/* ####### DEBUG ####### */

function onDebug(){
	console.log("dY:" + round(dY*10)/10 + "\tdX:" + round(dX*10)/10 
		+ "\ndT:" + round(dT * 10000)/10000
		+ "\nHue:" + round(hue));
}