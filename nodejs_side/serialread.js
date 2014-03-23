// Foursquare
var config = {
  'secrets' : {
    'clientId' : 'S0RJ4K5GPCNXAXZBYN3ZNOFIRQGS0KEP0VOMQKFNW1HC4HIR',
    'clientSecret' : 'KFCLE3FRJX05HACKRNFWSADFU5UXGGQJQYUGFKQEBGQ2VY4Y',
    'redirectUrl' : 'http://lvh.me:3000/callback'
  }
}
var foursquare = require('node-foursquare')(config);
// Serial
var com = require("serialport");
// MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fsqarduino');
var db = mongoose.connection;
var keySchema = mongoose.Schema({
    name: String,
    authkey: String
});
var key = mongoose.model('key', keySchema);

var checkinFoursquare = function(accessToken){
    foursquare.Checkins.addCheckin('4a15c43af964a520ce781fe3', {}, accessToken, function(){
        console.log("Checkin Confirmed :)");
    });
}

var serialPort = new com.SerialPort("/dev/cu.usbmodem1421", {
    baudrate: 9600,
    parser: com.parsers.readline('\r\n')
});

serialPort.on('open',function() {
    console.log('Everything is alive!');
});

serialPort.on('data', function(data){
    console.log(data);
}
