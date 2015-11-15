var audiolib = {};

function audioLoad() {
	audiolib.sun = [];
	audiolib.sun[0] = loadSound('audio/sun1.mp3');
	audiolib.sun[1] = loadSound('audio/sun2.mp3');
}

function audioInit() {
	console.log("audioinit");

	colorMode(HSB);

	audiolib.sun[0].play();
}

function audioUpdate() {}

function audioRefresh(data) {
	console.log(data);

	var brightness = constrain(map(data.temp, 0, 100, 10, 80), 0, 100);

	background(40, 120, brightness);
}