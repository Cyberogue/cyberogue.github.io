var particles = [];
var snowColor = 'rgba(255,255,255,.9)';
var rainColor = 'rgba(0,51,102,.5)';

function particleInit() {
	angleMode(DEGREES);
}

function particleUpdate() {
	for (var i = 0; i < particles.length; i++) {
		particles[i].draw();
	}
}

function particleRefresh(data) {
	console.log(data);

	colorMode(RGB);
	particles = [];
	if (data.rain > 0 || data.snow > 0) {
		var amt = data.rain + data.snow;
		var l = amt / (1 + data.rain);
		var c = lerpColor(color(snowColor), color(rainColor), l);

		var vY0 = 2.5;
		var vX0 = 150 * cos(data.wind);
		if (data.main == 'Snow') {
			vY0 *= .25;
			vX0 *= 1.5;
		}

		for (var i = 0; i < ceil(4 * amt * windowWidthSpace); i++) {
			var vX = vX0 * (1.25 - random() * .5);
			var vY = vY0 * (300 + random() * 50);

			particles.push(new fallingParticle(vX, vY, 7.5 * windowSpace, 15 * windowSpace, c));
		}
	}
}

/* ###### PARTICLES ##### */

function fallingParticle(vX, vY, width, height, color) {
	this.x = random(windowWidth);
	this.y = random(windowHeight);
	this.vX = vX;
	this.vY = vY;
	this.width = width;
	this.height = height;
	this.fill = color;

	this.draw = function() {
		this.x += this.vX * deltaTime;
		this.y += this.vY * deltaTime;

		if (this.x < 0 || this.x > windowWidth) this.x = random() * windowWidth;

		if (this.y < 0) this.y = windowHeight - 1;
		else if (this.y > windowHeight) this.y = 1;
		strokeWeight(.35);
		stroke('white');
		fill(this.fill);
		ellipse(this.x, this.y, this.width, this.height);
	}
}