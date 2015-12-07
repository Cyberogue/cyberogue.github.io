/* ####### CONFIG ###### */
var transTime = 2;
var tempScaleMin = -30;
var tempScaleMax = 30;

/* ####### CONTAINERS ###### */
var audiolib = {};
var audio = {};
var bgcolors = {};

/* ####### GLOBALS ###### */
var bgcolor;
var masterVolume = 1;

function audioLoad() {
	//var host = getURL();
	//host = host.substring(0, host.lastIndexOf('/')) + "/audio/";
	var host = 'http://cyberogue.github.io/weather/audio/';

	audiolib = {};
	audiolib.day = [
		loadSound(host + '20d_loop.wav')
	];

	audiolib.night = [
		loadSound(host + '22n_loop.wav')
	];

	audiolib.cloudy = [
		loadSound(host + '20c_loop.wav')
	];

	audiolib.humid = [
		loadSound(host + '80_loop.wav')
	];

	audiolib.dry = [
		loadSound(host + '85_loop.wav')
	];

	audiolib.wind = [
		loadSound(host + '32_loop.wav')
	];

	audiolib.rain = [
		loadSound(host + '10_loop.wav')
	];

	audiolib.snow = [
		loadSound(host + '40_loop.wav')
	];

	audiolib.storm = [
		loadSound(host + '50_loop.wav')
	];

	audiolib.atmosphere = [
		loadSound(host + '60_loop.wav')
	];

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


/* ####### WEATHERS ###### */

function cueWind(data) {
	mapData('wind', data.windspeed, 0, 10, 0, .1, .6);
}

function cueSnow(data) {
	if (data.snow == 0 && data.main == 'Snow')
		setData('snow', .2);
	else
		mapData('snow', data.snow, 1, 5, .2, .2);
}

function cueRain(data) {
	if (data.rain == 0 && (data.main == 'Rain' || data.main == 'Drizzle'))
		setData('rain', .05);
	else
		mapData('rain', data.rain, 0, 5, .2, .2);
}

function cueStorm(data) {
	if (floor(data.id / 100) == 2 || (data.id >= 900 && data.id <= 902) || (data.id >= 960 && data.id <= 962))
		setData('storm', 1);
	else
		setData('storm', 0);
}

function cueAtmo(data) {
	if (floor(data.id / 100) == 7 || data.icon == '50n' || data.icon == '50d')
		setData('atmosphere', 1);
	else
		setData('atmosphere', 0);
}

function cueHumidity(data) {
	mapData('dry', 100 - data.humidity, 0, 100, .4, .3, .5);
	mapData('humid', data.humidity, 0, 100, .4, .4);
}

function cueCloudCover(data) {
	mapData('cloudy', data.clouds, 0, 100, .5, .3);

	if (data.icon[2] == 'n') {
		mapData('night', 100 - data.clouds, 0, 120, .5, .2, .8);
		setData('day', 0);
	} else {
		mapData('day', 100 - data.clouds, 0, 120, .5, .2, .8);
		setData('night', 0);
	}
}

function audioRefresh(data) {
	console.log(data);

	colorRefresh(data);

	cueWind(data);
	cueSnow(data);
	cueRain(data);
	cueStorm(data);
	cueAtmo(data);
	cueHumidity(data);
	cueCloudCover(data);
}

/* ####### FUNCTIONS ###### */
function mapData(tag, value, min, max, vthresh, vmin, vmax) {
	if (!audio[tag]) return;
	if (!vmin) vmin = 0;
	if (!vmax) vmax = 1;

	var v = map(value, min, max, 0, 1);

	if (v <= vthresh) {
		v = 0;
	} else {
		v = constrain(v, vmin, vmax);
		console.log('v:' + round(100 * v) + '%\t' + tag);
	}

	audio[tag].setVolume(v);
}

// alpha controls the curve amount between 0 and 1, with .5 being linear. A value of 0 curves up, a value of 1 curves down
// it's  simplification of alpha(x^2) + (1-alpha)(1 - (1-x^2))
function mapDataCurve(tag, value, alpha, min, max, vthresh, vmin, vmax) {
	if (!audio[tag]) return;
	if (!vmin) vmin = 0;
	if (!vmax) vmax = 1;

	var v = map(value, min, max, 0, 1);

	if (v <= vthresh) {
		v = 0;
	} else {
		// Curve
		v = constrain(alpha * v * (2 * v - 2) + (2 - v) * v, vmin, vmax);
		console.log('v:' + round(100 * v) + '%\t' + tag);
	}

	audio[tag].setVolume(constrain(v, vmin, vmax));
}

function setData(tag, value) {
	if (value > 0) console.log('v:' + round(100 * value) + '%\t' + tag);
	if (audio[tag]) audio[tag].setVolume(constrain(value, 0, 1));
}

function audioInit() {
	colorMode(RGB);

	bgcolor = new bgColorManager(color(0, 0, 20), transTime);

	var logfile = "";
	for (key in audiolib) {
		logfile += key + " (" + audiolib[key].length + ")\n";
		if (audiolib[key].length > 0) audio[key] = null;

		for (var i = 0; i < audiolib[key].length; i++) {
			audiolib[key][i].loop();
			audiolib[key][i].setVolume(0);
			//audiolib[key][i].pause();
		}
	}
	console.log(logfile);
}

function audioNew() {
	for (key in audio) {
		if (audio[key]) {
			audio[key].pause();
			audio[key].stop();
			delete audio[key];
		}

		if (audiolib[key].length > 0) {
			audio[key] = audiolib[key][floor(random(audiolib[key].length))];
			audio[key].jump(0);
			audio[key].setVolume(0);
		} else {
			delete audio[key];
		}
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
	tempAdj = .5 + constrain(tempAdj, 0, 1)
	s *= tempAdj

	if ((b * (100 - s)) / 10000 > .70) {
		queryDisplay.style('color', '#222');
		descDisplay.style('color', '#222');
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