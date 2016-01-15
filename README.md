# Open Weather Map Service Plugin

Open Weather Map Service Plugin for the Reekoh IoT Platform.

Uses request npm library

**Process:**

1. Uses a regular npm request library to send a request to the Open Weather Map API URL.
2. URL: http://api.openweathermap.org/data/2.5/
3. Supports both Current and History weather request
4. Supports City, City Id and Coordinates type of location request
5. Missing required fields in the request will not push the request will return a JSON Object 
   {message: 'Missing field details', missingField: 'nameOfField'}

**Expected Fields**

These fields are expected from the data being sent to be included in the request:

city - required if request is City
country - (Optional) used with city field
city_id - required if request is City Id
lat, lon - required if request is Coordinates
start - start time in UNIX Format for Historical request
end - (Optional) end time in UNIX Format for Historical request, if this is missing a default cnt=1 will be used
cnt = count of returned data will not be used if end is existing for historical and not used in Current weather


