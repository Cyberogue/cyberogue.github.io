var audiolib = {};

function audioLoad() {
	var host = getURL();
	host = host.substring(0, host.lastIndexOf('/')) + "/audio/";
	console.log(host);

	audiolib.sun = [
		loadSound(host + 'sun1.mp3'),
		loadSound(host + 'sun2.mp3')
	];
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