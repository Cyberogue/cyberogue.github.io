/* ####### CONFIG ###### */
var transTime = 2;
var tempScaleMin = -10;
var tempScaleMax = 20;

/* ####### CONTAINERS ###### */
var audiolib = {};
var audio = {};
var bgcolors = {};

/* ####### GLOBALS ###### */
var bgcolor;

function audioLoad() {
	//var host = getURL();
	//host = host.substring(0, host.lastIndexOf('/')) + "/audio/";
	var host = 'http://cyberogue.github.io/weather/audio/';

	audiolib.sun = [];

	audiolib.wind = [
		loadSound(host + '32_loop.wav')
	];

	audiolib.rain = [];

	bgcolors = {
		"default": "#92c9e9", // Default
		"01d": "#55b2f4", // Clear sky
		"01n": "#193a68",
		"02d": "#64b0e6", // Few clouds
		"02n": "#3c567a",
		"03d": "#7cb3db", // Scattered clouds
		"03n": "#45506a",
		"04d": "#7ca4c1", // Broken clouds
		"04n": "#4a629a",
		"09d": "#8ac4d3", // Shower rain
		"09n": "#3e7384",
		"10d": "#afdbdc", // Rain
		"10n": "#3c5b64",
		"11d": "#a9a4ee", // Thunder
		"11n": "#504570",
		"13d": "#dcdbda", // Snow
		"13n": "#a9a9a9",
		"50d": "#ced6d8", // Mist/fog
		"50n": "#565c62",
	};
}

function audioInit() {
	colorMode(RGB);

	bgcolor = new bgColorManager(color(0, 0, 20), transTime);

	var logfile = "";
	for (key in audiolib) {
		logfile += key + " (" + audiolib[key].length + ")\n";
		if (audiolib[key].length > 0) audio[key] = null;
	}
	console.log(logfile);
}

function audioNew() {
	for (key in audio) {
		if (audio[key])
			audio[key].stop();

		if (audiolib[key].length > 0) {
			audio[key] = audiolib[key][floor(random(audiolib[key].length))];
			audio[key].loop();
			audio[key].pause();
		} else {
			audio[key] = null;
		}
	}
}

function audioRefresh(data) {
	colorRefresh(data);

	if (audio.wind) {
		var a = map(data.windspeed, 1, 10, 0, 1);
		a = constrain(a * a, 0, 1);
		audio.wind.play();
		audio.wind.amp(a);
	}
}

function colorRefresh(data) {
	colorMode(RGB);
	var c;

	if (data.icon in bgcolors) c = color(bgcolors[data.icon]);
	else c = color(bgcolors['default']);
	colorMode(HSB);

	var h = hue(c),
		s = saturation(c),
		b = brightness(c);

	// Adjust for temperature
	var tempAdj = map(data.temp, tempScaleMin, tempScaleMax, 0, 1);
	tempAdj = constrain(tempAdj, 0, 1)
	b = constrain(b * tempAdj, 20, 240);

	if (b * s / 10000 > .8) {
		queryDisplay.style('color', 'black');
		descDisplay.style('color', 'black');
	} else {
		queryDisplay.style('color', 'white');
		descDisplay.style('color', 'white');
	}

	bgcolor.set(color(h, s, b));
}

function audioUpdate() {
	colorMode(HSB);
	bgcolor.update();
	background(bgcolor.current);
}

function bgColorManager(color, t) {
	this.current = color;
	this.previous = color;
	this.target = color;
	this.index = 0;
	this.speed = t;

	this.update = function() {
		if (this.index <= 1 && this.current != this.target) {
			this.index += this.speed * deltaTime
			colorMode(RGB);
			this.current = lerpColor(this.previous, this.target, this.index);
		}
	}

	this.set = function(target) {
		this.index = 0;
		this.target = target;
		this.previous = this.current;
	}
}