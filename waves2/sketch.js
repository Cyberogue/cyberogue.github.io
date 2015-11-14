/* ###### CONFIG ######## */

/* ###### ADVANCED ###### */
var gridSqSize = 10;
var gridSqSpacing = 10;
var count = 20;

/* ###### GLOBALS ####### */
var s1,s2,s3,s4;
var scale;

function setup(){
	createCanvas(windowWidth, windowHeight);
	background(0, 0, 20);

	angleMode(RADIANS);
	colorMode(HSB);
	smooth();

	scale = new Array(count);
	for (var i = 0; i < scale.length; i++){
		var x = windowWidth / count * i;
		scale[i] = new gridScale(x, windowHeight/2, 15, i/scale.length * 1000);

		if (i%2==0) scale[i].period *= 1.001;
	}
}

function draw(){
	background(0, 0, 0);
	//console.clear();
	stroke(hue, 255, 20);
	
	for (var i = 0; i < scale.length; i++){
		var hue = 360 * scale[i].x / windowWidth;
		fill(hue, 100, 120);

		scale[i].update();
		scale[i].draw();
	}
}

/* ####################### */

function gridScale(x, y, a, phase){
	this.x = x; 
	this.y = y;

	this.maxvalue = a;

	this.value = a;

	this.period = 1000;
	this.phase = phase;

	this.update = function(){
		var c_t = cos(((millis() + this.phase) % this.period) / this.period * TAU);
		this.value = round(this.maxvalue * (1 + c_t) / 2);
	}

	this.draw = function(){
		log ("Draw " + this.x + ", " + this.y);
		var s = gridSqSize + gridSqSpacing;
		for (var i = 0; i < this.value; i++){
			rect(x, y - i * s, gridSqSize, gridSqSize);
		}
	}
}