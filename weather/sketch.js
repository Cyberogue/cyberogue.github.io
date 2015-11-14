/* ###### CONFIG ###### */
var tempMin = 0;
var tempMax = 100;

/* ###### ADVANCED #### */
var updateRate = 1; // Times per second
var refreshRate = 30; // Delay = refreshRate / updateRate

/* ###### GLOBALS ##### */
var weather;
var query;

var queryField;
var toggleButton;
var queryDisplay;
var descDisplay;
var showQuery = false;

var nextUpdate = 0;
var refreshTimer = 0;

/* ###### SETUP ######## */

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(20);

	// Create query box
	queryField = createInput('Search...');
	queryField.changed(forceRefresh);
	queryField.style('width', '100');
	queryField.position(50, 25);
	queryField.hide();

	// Create submit button
	toggleButton = createButton('>');
	toggleButton.mouseReleased(toggleQuery);
	toggleButton.position(25, 25);

	// Create text display
	queryDisplay = createSpan('');
	queryDisplay.style('align', 'center');
	queryDisplay.style('font-size', 72);
	queryDisplay.style('text-align', 'center');
	queryDisplay.style('font-family', 'sans-serif');
	queryDisplay.style('color', 'white');
	queryDisplay.style('width', windowWidth.toString());
	queryDisplay.position(0, windowHeight / 2);

	// Create description display
	descDisplay = createSpan('');
	descDisplay.style('align', 'center');
	descDisplay.style('font-size', 20);
	descDisplay.style('text-align', 'center');
	descDisplay.style('font-family', 'sans-serif');
	descDisplay.style('color', 'white');
	descDisplay.style('width', windowWidth.toString());
	descDisplay.position(0, windowHeight / 2 + 100);

	// Open API
	weather = new OpenWeatherMap("eb7c74d1367f20a87ddff4cdbfd9aab0");
	//OpenWeatherMap.debug = true;
	// Go!
	query = 'New York City';
	refresh();

	audioInit();
}

/* ####### RUNTIME ###### */

function update() {
	var data;

	if (OpenWeatherMap.data) data = weather.read();

	if (data) {
		queryDisplay.html(data.name);
		descDisplay.html(data.description);
		audioConfig(data);
	} else {
		queryDisplay.html('');
		descDisplay.html('');
	}
}

function refresh() {
	console.log("Pull from " + query);
	weather.request(query);
	refreshTimer = 0;
}

/* ####### GUI ######### */

function forceRefresh() {
	query = queryField.value();
	setQuery(false);
	refresh();
}

function setQuery(show) {
	showQuery = show;
	if (show) {
		queryField.show();
		toggleButton.html('<');
	} else {
		queryField.hide();
		toggleButton.html('>');
	}
}

function toggleQuery() {
	setQuery(!showQuery);
}

/* ####### ENGINE ###### */

function draw() {
	if (millis() >= nextUpdate) {
		nextUpdate = millis() + 1000 / updateRate;
		update();

		if (++refreshTimer >= refreshRate) refresh();
	}

	audioUpdate();
}