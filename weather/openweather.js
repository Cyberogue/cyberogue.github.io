OpenWeatherMap = function(apikey) {
	this.key = apikey;
	this.xml = new XMLHttpRequest();
	this.xml.onreadystatechange = function() {
		if (this.readyState != 4) return;

		var data = JSON.parse(this.responseText);
		if (!data.message) {
			OpenWeatherMap.data = data;
			if (OpenWeatherMap.debug) console.log(data);
		} else if (OpenWeatherMap.debug) console.log(data.message);
	}
}

OpenWeatherMap.prototype.debug = false;
OpenWeatherMap.prototype.data = undefined;

OpenWeatherMap.prototype.request = function(query, countrycode) {
	if (!countrycode) countrycode = 'us';

	var call = 'http://api.openweathermap.org/data/2.5/weather?q=' + query.replace(" ", "%20") + ',' + countrycode + '&appid=' + this.key + "&units=metric";

	this.ready = false;
	this.xml.open("GET", call, true);
	this.xml.send();
}

OpenWeatherMap.prototype.read = function() {
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

	if (OpenWeatherMap.data.rain) {
		container.rain = OpenWeatherMap.data.rain["3h"];
	} else {
		container.rain = 0;
	}

	return container;
}