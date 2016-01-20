function Synthesizer() {}

Synthesizer.initialize = function(buffersize, type) {
	if (!buffersize) {
		console.warn('No buffer size specified, defaulting to 6');
		buffersize = 6;
	}

	this.env = [];
	this.osc = [];
	this.amp = [];
	this.pressed = [];

	for (var i = 0; i < buffersize; i++) {
		this.env[i] = new p5.Env(0.01, 1, 0.2, 0.7, 0, 0.7, 0.2, 0);

		this.amp[i] = new p5.Amplitude();
		this.amp[i].setInput(this.env[i]);

		this.osc[i] = new p5.Oscillator();
		this.osc[i].amp(this.env[i]);
		if (type) this.osc[i].setType(type);
		this.osc[i].start();
	}
}

Synthesizer.startNote = function(midi) {
	var f = midiToFreq(midi);
	var index = -1;

	for (var i = this.osc.length - 1; i >= 0; i--) {
		if (this.amp[i].getLevel() == 0 || (this.osc[i].f == f && !this.pressed[i])) index = i;
		else if (this.osc[i].f == f && this.pressed[i]) return false;
	}

	console.log('^^ ' + midi + ' [' + index + ']');

	if (index < 0) {
		console.warn('Buffer overflow');
		return false;
	}

	this.osc[index].freq(f);

	this.env[index].triggerAttack();
	this.pressed[index] = true;
	return true;
}

Synthesizer.stopNote = function(midi) {
	var f = midiToFreq(midi);

	console.log('vv ' + midi);

	for (var i = 0; i < this.osc.length; i++) {
		if (this.osc[i].f == f && this.amp[i].volume > 0.05) {
			this.env[i].triggerRelease();
			this.pressed[i] = false;
		}
	}
}

Synthesizer.stopAll = function() {
	console.log('vv all');
	for (var i = 0; i < this.osc.length; i++) {
		this.env[i].triggerRelease();
		this.pressed[i] = false;
	}
}

Synthesizer.setType = function(type) {
	for (var i = 0; i < this.osc.length; i++) {
		this.osc[i].setType(type);
	}
}

Synthesizer.logBuffer = function() {
	var s = "";
	for (var i = 0; i < this.osc.length; i++) {
		s += i + ':' + round(this.osc[i].f) + ':' + (round(this.amp[i].getLevel() * 100) / 100) + '\n';
	}
	console.log(s);
	return s;
}

Synthesizer.stop = function() {
	console.log('Synthesizer stopped');

	for (var i = 0; i < this.osc.length; i++) {
		this.osc[i].stop();
	}
}