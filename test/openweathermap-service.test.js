'use strict';

var cp     = require('child_process'),
	assert = require('assert'),
	service;

describe('Service', function () {
	this.slow(5000);

	after('terminate child process', function (done) {
		this.timeout(7000);

		setTimeout(() => {
			service.kill('SIGKILL');
			done();
		}, 5000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			assert.ok(service = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			service.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			service.send({
				type: 'ready',
				data: {
					options: {
						request_type: 'Current',
						location_type: 'Coordinates',
						apiKey: 'f78d4384f085d71cb1173f100f856d3e'
					}
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should process the JSON data and send back a result', function (done) {
			var requestId = (new Date()).getTime().toString();

			service.on('message', function (message) {

				if (message.type === 'result') {

					var jsonData = JSON.parse(message.data);

					assert.equal(14.6, jsonData.coord.lat);
					assert.equal(120.98, jsonData.coord.lon);
					assert.equal(message.requestId, requestId);
					done();
				}
			});

			service.send({
				type: 'data',
				requestId: requestId,
				data: {
					lat: '14.6',
					lon: '120.98'
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});
});