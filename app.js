var express = require('express');
var app = express();
var request = require('request');
var settings = require('./settings');
var Keen = require("keen.io");
var bodyParser = require('body-parser');

var client = Keen.configure({
    projectId: settings.keen_project_id,
    writeKey: settings.keen_write_key
});

app.use( bodyParser.json() );

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
    console.log(accessPoints);
    request.post('https://www.googleapis.com/geolocation/v1/geolocate?key=' + settings.google_api_key,
        {"wifiAccessPoints": JSON.stringify(accessPoints)},
        function(err, response, body){
            console.log(err, body);
            if(body.location) sendToKeen(body.location);
            return res.sendStatus(200);

        }
    );
    
});

var sendToKeen = function(location){
    client.addEvent("locator", {"keen.location.coordinates":[location.lat, location.lng]}, function(err, res){
        console.log(err, res);
    });
};

var server = app.listen(process.env.PORT || 4000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});