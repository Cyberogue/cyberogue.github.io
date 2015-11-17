var particles = [];
var snowColor = 'rgba(255,255,255,.9)';
var rainColor = 'rgba(0,51,102,.3)';

function particleInit() {}

function particleUpdate() {
	for (var i = 0; i < particles.length; i++) {
		particles[i].draw();
	}
}

function particleRefresh(data) {
	colorMode(RGB);
	particles = [];
	if (data.main == 'Rain' || data.main == 'Snow') {
		var amt = 1 + data.rain + data.snow;
		var l = amt / (1 + data.rain);
		var c = lerpColor(color(snowColor), color(rainColor), l);

		var v = 2;
		if (data.main == 'Snow') v *= .25;

		console.log(c);

		for (var i = 0; i < 5 * amt; i++) {
			var vX = (1 - random(2)) * amt;
			var vY = v * (300 + random(35 * amt));

			particles.push(new fallingParticle(vX, vY, 5, 10, c));
		}
	}
}

/* ###### PARTICLES ##### */

function fallingParticle(vX, vY, width, height, color) {
	this.x = random(windowWidth);
	this.y = random(windowHeight);
	this.vX = vX / 60;
	this.vY = vY / 60;
	this.width = width;
	this.height = height;
	this.fill = color;

	this.draw = function() {
		this.x += this.vX;
		this.y += this.vY;

		if (this.x < 0 || this.x > windowWidth) this.x = random(windowWidth);

		if (this.y < 0) this.y = windowHeight - 1;
		else if (this.y > windowHeight) this.y = 1;

		noStroke();
		fill(this.fill);
		ellipse(this.x, this.y, this.width, this.height);
	}
}