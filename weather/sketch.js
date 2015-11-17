/* ###### CONFIG ###### */
var tempMin = 0;
var tempMax = 100;

/* ###### ADVANCED #### */
var updateRate = 20; // Seconds

/* ###### GLOBALS ##### */
var api;
var query;

var queryField;
var toggleButton;
var queryDisplay;
var descDisplay;
var cycleStates = true;
var showQuery = false;

var lastReceived = 0;
var nextUpdate = 0;
var refreshTimer = 0;

var stateCapitalTimer = 0; // Updates

/* ###### SETUP ######## */

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(20)

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
	api = new OpenWeatherMap("eb7c74d1367f20a87ddff4cdbfd9aab0");
	//OpenWeatherMap.debug = true;

	// Extract parameters
	var param = getURL();
	var ind_q = param.indexOf("query=") + 6;
	if (ind_q > 6) {
		cycleStates = false;
		query = param.substring(ind_q, param.length);
		stateCapitalTimer = 6;
	}

	audioInit();
	particleInit();
}

/* ####### RUNTIME ###### */

function apiRequest() {
	api.request(query);
	refreshTimer = 0;
}

function apiReceive() {
	// Create object to pass
	var container = {};

	container.clouds = OpenWeatherMap.data.clouds.all;

	container.name = OpenWeatherMap.data.name;
	container.humidity = OpenWeatherMap.data.main.humidity;
	container.pressure = OpenWeatherMap.data.main.pressure;
	container.temp = OpenWeatherMap.data.main.temp;

	container.main = OpenWeatherMap.data.weather[0].main;
	container.description = OpenWeatherMap.data.weather[0].description;
	container.icon = OpenWeatherMap.data.weather[0].icon;
	container.id = OpenWeatherMap.data.weather[0].id;

	container.windspeed = OpenWeatherMap.data.wind.speed;
	container.wind = OpenWeatherMap.data.wind.deg;

	container.receiveTime = OpenWeatherMap.data.time;

	if (OpenWeatherMap.data.rain) container.rain = OpenWeatherMap.data.rain["3h"];
	else container.rain = 0;

	if (OpenWeatherMap.data.snow) container.snow = OpenWeatherMap.data.snow["3h"];
	else container.snow = 0;

	// Update text and description
	queryDisplay.html(container.name);
	var desc = container.description.charAt(0).toUpperCase() + container.description.slice(1).toLowerCase();
	descDisplay.html(desc + ' | ' + round(container.temp) + '°C');

	// Update audio
	audioRefresh(container);
	particleRefresh(container);
}

/* ####### GUI ######### */

function forceRefresh() {
	query = queryField.value();
	setQuery(false);
	nextUpdate = millis() + 1000 * updateRate;
	stateCapitalTimer = 6;
	apiRequest();
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

function preload() {
	audioLoad();
}

function draw() {
	if (millis() >= nextUpdate) {
		nextUpdate = millis() + 1000 * updateRate;

		if (cycleStates && --stateCapitalTimer <= 0) {
			stateCapitalTimer = 6;
			query = stateCapitals[floor(random() * stateCapitals.length)];
		}

		apiRequest();
	}

	if (OpenWeatherMap.data && (!lastReceived || lastReceived < OpenWeatherMap.data.time)) {
		lastReceived = OpenWeatherMap.data.time;
		apiReceive();
	}

	audioUpdate();
	particleUpdate();
}