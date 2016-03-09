'use strict';

var platform = require('./platform'),
	request = require('request'),
	isPlainObject = require('lodash.isplainobject'),
	isArray = require('lodash.isarray'),
	async = require('async'),
	opt;

let sendData = (requestId, data) => {
	var search_url, url, missingParam = null;

	if (opt.location_type === 'City') {
		if (data.city)
			search_url = 'q=' + data.city;
		else
			missingParam = {message: 'Field (city) City is missing in the data and required for the request.', missingField: 'city'};

		if (data.country) search_url = search_url + ',' + data.country;

	} else if (opt.location_type === 'City Id') {
		if (data.city_id)
			search_url = 'id=' + data.city_id;
		else
			missingParam = {message: 'Field (city_id) City Id is missing in the data and required for the request.', missingField: 'city_id'};

	} else {
		if (data.lat)
			search_url = 'lat=' + data.lat;
		else
			missingParam = {message: 'Field (lat) Latitude is missing in the data and required for the request.', missingField: 'lat'};

		if (data.lon)
			search_url = search_url + '&lon=' + data.lon;
		else
			missingParam = {message: 'Field (lon) Longitude is missing in the data and required for the request.', missingField: 'lon'};
	}


	if (opt.request_type === 'History') {
		if (data.start)
			search_url = search_url + '&start=' + data.start;
		else
			missingParam = {message: 'Field (start) Start Time is missing in the data and required for the request.', missingField: 'start'};

		if (data.end)
			search_url = search_url + '&end=' + data.end;
		else if (data.cnt)
			search_url = search_url + '&cnt=' + data.cnt;
		else
			search_url = search_url + '&cnt=1';

		url = 'http://api.openweathermap.org/data/2.5/history/city?type=hour&' + search_url + '&APPID=' + opt.apiKey;
	} else if (opt.request_type === 'Forecast Daily') {
		if (data.cnt) search_url = search_url + '&cnt=' + data.cnt;
		url = 'http://api.openweathermap.org/data/2.5/history/daily?' + search_url + '&APPID=' + opt.apiKey;
	} else if (opt.request_type === 'Forecast 3 Hour') {
		if (data.cnt) search_url = search_url + '&cnt=' + data.cnt;
		url = 'http://api.openweathermap.org/data/2.5/forecast?' + search_url + '&APPID=' + opt.apiKey;
	} else
		url = 'http://api.openweathermap.org/data/2.5/weather?' + search_url + '&APPID=' + opt.apiKey;

	if (missingParam) {
		platform.sendResult(requestId, missingParam);
	} else {
		request(url, function (err, response, body) {

			if (err) {
				console.error(err);
				platform.handleException(err);
			}
			else {
				platform.sendResult(requestId, body);
				platform.log(JSON.stringify({
					title: 'Open Weather Map Service Result',
					input: data,
					result: body
				}));
			}
		});
	}
};

platform.on('data', function (requestId, data) {
	if(isPlainObject(data)){
		sendData(requestId, data);
	}
	else if(isArray(data)){
		async.each(data, (datum) => {
			sendData(requestId, datum);
		});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`));
});

platform.once('close', function () {
	let d = require('domain').create();

	d.once('error', function(error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
		d.exit();
	});

	d.run(function() {
		// TODO: Release all resources and close connections etc.
		platform.notifyClose(); // Notify the platform that resources have been released.
		d.exit();
	});
});

platform.once('ready', function (options) {
	opt = options;
	platform.notifyReady();
	platform.log('Open Weather Map Service has been initialized.');
});