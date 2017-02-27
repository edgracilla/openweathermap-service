'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.Service()
const request = require('request')

let searchUrl = null
let url = null
let missingParam = null

_plugin.on('data', (data) => {
  if (_plugin.config.locationType === 'City') {
    if (data.city) searchUrl = 'q=' + data.city
    else { missingParam = {message: 'Field (city) City is missing in the data and required for the request.', missingField: 'city'} }

    if (data.country) searchUrl = searchUrl + ',' + data.country
  } else if (_plugin.config.locationType === 'City Id') {
    if (data.cityId) searchUrl = 'id=' + data.cityId
    else {
      missingParam = {message: 'Field (city_id) City Id is missing in the data and required for the request.', missingField: 'city_id'}
    }
  } else {
    if (data.lat) searchUrl = 'lat=' + data.lat
    else {
      missingParam = {message: 'Field (lat) Latitude is missing in the data and required for the request.', missingField: 'lat'}
    }

    if (data.lon) searchUrl = searchUrl + '&lon=' + data.lon
    else {
      missingParam = {message: 'Field (lon) Longitude is missing in the data and required for the request.', missingField: 'lon'}
    }
  }

  if (_plugin.config.requestType === 'History') {
    if (data.start) searchUrl = searchUrl + '&start=' + data.start
    else {
      missingParam = {message: 'Field (start) Start Time is missing in the data and required for the request.', missingField: 'start'}
    }

    if (data.end) searchUrl = searchUrl + '&end=' + data.end
    else if (data.cnt) searchUrl = searchUrl + '&cnt=' + data.cnt
    else {
      searchUrl = searchUrl + '&cnt=1'
    }
    url = 'http://api.openweathermap.org/data/2.5/history/city?type=hour&' + searchUrl + '&APPID=' + _plugin.config.apiKey
  } else if (_plugin.config.requestType === 'Forecast Daily') {
    if (data.cnt) searchUrl = searchUrl + '&cnt=' + data.cnt
    url = 'http://api.openweathermap.org/data/2.5/history/daily?' + searchUrl + '&APPID=' + _plugin.config.apiKey
  } else if (_plugin.config.requestType === 'Forecast 3 Hour') {
    if (data.cnt) searchUrl = searchUrl + '&cnt=' + data.cnt
    url = 'http://api.openweathermap.org/data/2.5/forecast?' + searchUrl + '&APPID=' + _plugin.config.apiKey
  } else {
    url = 'http://api.openweathermap.org/data/2.5/weather?' + searchUrl + '&APPID=' + _plugin.config.apiKey
  }

  if (missingParam) {
    _plugin.pipe(missingParam)
  } else {
    request(url, (err, response, body) => {
      if (err) {
        return _plugin.logException(err)
      } else {
        _plugin.pipe(data, body)
          .then(() => {
            _plugin.log(JSON.stringify({
              title: 'Open Weather Map Service Result',
              data: data,
              result: body
            }))
          })
          .catch((error) => {
            _plugin.logException(error)
          })
        console.log(body)
      }
    })
  }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  _plugin.log('Open Weather Map Service has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
