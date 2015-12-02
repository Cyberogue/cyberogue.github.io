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
var masterVolume = 1;

function audioLoad() {
	//var host = getURL();
	//host = host.substring(0, host.lastIndexOf('/')) + "/audio/";
	var host = 'http://cyberogue.github.io/weather/audio/';

	audiolib.sun = [];

	audiolib.moon = [];

	audiolib.cloudy = [];

	audiolib.humid = [
		loadSound(host + '80_loop.wav')
	];

	audiolib.dry = [
		loadSound(host + '85_loop.wav')];

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

	audiolib.atmosphere = [];

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
function cueSnow(data) {
	if (data.snow < 1) {
		audio.snow.setVolume(0);
		return;
	}

	var a = map(data.snow, 0, 5, 0, 1);
	a = constrain(a * a, 0, 1);
	//audio.snow.play();
	audio.snow.setVolume(a, transTime);
}

function cueRain(data) {
	if (data.rain <= 0) {
		audio.rain.setVolume(0);
		return;
	}

	var a = map(data.rain, 0, 5, 0, 1);
	a = constrain(a * a, 0, 1);
	//audio.rain.play();
	audio.rain.setVolume(a, transTime);

}

function cueHumidity(data) {
	var rh = constrain(map(data.humidity, 50, 100, 0, 100), 0, 100);
	console.log(rh);
	if (rh >= 30) {
		audio.humid.setVolume(map(rh, 30, 100, .3, 1), transTime);
	} else {
		audio.humid.setVolume(0);
	}

	if (rh <= 60) {
		audio.dry.setVolume(map(rh, 0, 60, 1, .3), transTime);
	} else {
		audio.dry.setVolume(0);
	}
}

function cueWind(data) {
	if (data.wind < .5) {
		audio.wind.setVolume(0);
		return;
	}

	var a = map(data.windspeed, 0, 10, 0, 1);
	a = constrain(a * a, 0, 1);
	//audio.wind.play();
	audio.wind.setVolume(a, transTime);

}

function cueStorm(data) {
	if (floor(data.id / 100) == 2 || (data.id >= 960 && data.id <= 969)) {
		audio.storm.setVolume(0, transTime);
	} else {
		audio.storm.setVolume(1, transTime);
	}
}

function cueAtmo(data) {

}

function cueClouds(data) {

}

function cueOther(data) {

}

/* ####### FUNCTIONS ###### */
function audioInit() {
	colorMode(RGB);

	bgcolor = new bgColorManager(color(0, 0, 20), transTime);

	var logfile = "";
	for (key in audiolib) {
		logfile += key + " (" + audiolib[key].length + ")\n";
		if (audiolib[key].length > 0) audio[key] = null;

		for (var i = 0; i < audiolib[key].length; i++) {
			audiolib[key][i].setVolume(0);
			audiolib[key][i].loop();
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
		} else {
			delete audio[key];
		}
	}
}

function audioRefresh(data) {
	colorRefresh(data);

	if (audio.wind) cueWind(data);
	if (audio.snow) cueSnow(data);
	if (audio.rain) cueRain(data);
	if (audio.storm) cueStorm(data);
	if (audio.atmosphere) cueAtmo(data);

	if (audio.humid || audio.dry) cueHumidity(data);
	if (audio.cloudy && audio.sun && audio.moon) cueClouds(data);

	cueOther(data);
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