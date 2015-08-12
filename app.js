var express = require('express');
var app = express();
var request = require('request');
var settings = require('./settings');
var Keen = require("keen.io");

var client = Keen.configure({
    projectId: settings.keen_project_id,
    writeKey: settings.keen_write_key
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/geo', function(req, res){
    accessPoints = req.body.accessPoints;
    // Must be in this form
    // {
    //     "macAddress": "01:23:45:56:89:AB",
    //     "signalStrength": -65,
    //     "age": 0,
    //     "channel": 11,
    //     "signalToNoiseRatio": 40
    // }

    request.post({
        url: 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + settings.google_api_key,
        headers:{
            'content-type':'application/json'
        },
        body: {
            wifiAccessPoints: accessPoints
        }
    },
    function (error, response, body){
        if (!error && response.statusCode == 200) {
            console.log(body);  // Show the HTML response.
            sendToKeen(body.location);
        } else {
            console.log("Request failed");
        }
    });
    
});

var sendToKeen = function(location){
    client.addEvent("locator", {"keen.location.coordinates":[location.lat, location.lng]}, function(err, res){
        console.log(err, res);
    });
};

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});