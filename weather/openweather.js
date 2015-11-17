OpenWeatherMap = function(apikey) {
	this.key = apikey;
	this.xml = new XMLHttpRequest();
	this.xml.onreadystatechange = function() {
		if (this.readyState != 4) return;

		var data = JSON.parse(this.responseText);
		if (!data.message) {
			OpenWeatherMap.data = data;
			OpenWeatherMap.data.time = millis(); // When it was received
			if (OpenWeatherMap.debug) console.log("Received: " + round(OpenWeatherMap.data.time));
		} else if (OpenWeatherMap.debug) console.log(data.message);
	}
}

OpenWeatherMap.prototype.debug = false;
OpenWeatherMap.prototype.data = undefined;

OpenWeatherMap.prototype.request = function(query, countrycode) {
	var call = 'http://api.openweathermap.org/data/2.5/weather?q=' + query.replace(" ", "%20") + (countrycode? countrycode:'') + '&appid=' + this.key + "&units=metric";

	this.ready = false;
	this.xml.open("GET", call, true);
	this.xml.send();

	if (OpenWeatherMap.debug) console.log("Request '" + query + "': " + round(millis()));
}