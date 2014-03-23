// Foursquare
var config = {
  'secrets' : {
    'clientId' : 'S0RJ4K5GPCNXAXZBYN3ZNOFIRQGS0KEP0VOMQKFNW1HC4HIR',
    'clientSecret' : 'KFCLE3FRJX05HACKRNFWSADFU5UXGGQJQYUGFKQEBGQ2VY4Y',
    'redirectUrl' : 'http://lvh.me:3000/callback'
  }
}
var foursquare = require('node-foursquare')(config);
var express = require('express');
var app = express();

// Serial
var com = require("serialport");

// HTTP
var http = require('http')
var path = require('path');

// MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fsqarduin');
var db = mongoose.connection;
var keySchema = mongoose.Schema({
    name: String,
    authkey: String
});
var key = mongoose.model('key', keySchema);

/*
    Courant: 4ac3bac3f964a520969c20e3
    Maoz: 4a15c43af964a520ce781fe3
*/
var placeID = '4a15c43af964a520ce781fe3';

// What is the current HEX
var currentUserID = '';

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var checkinFoursquare = function(accessToken, place){
    foursquare.Checkins.addCheckin(placeID, {}, accessToken, function(){
        console.log("Checkin Confirmed :)");
        io.sockets.on('connection', function(socket) {
            socket.emit('checkinsuccessful', { num: 1 });
        });
    });
};

app.get('/', function(req, res){
    res.render('index', { titlewhole: 'Foursquare Checkin Status', title: 'Please use your RFID/NFC card on the device'});
});

app.get('/login', function(req, res){
    res.writeHead(303, {
        'location': foursquare.getAuthClientRedirectUrl()
    });
    res.end();
});

app.get('/callback', function(req, res){
    foursquare.getAccessToken({
        code: req.query.code
    }, function(error, accessToken){
        if(error){
            res.send('An error was thrown: ' + error.message);
        } else {
            res.send(accessToken);
            if(currentUserID != -1){
                new keySchema({
                    name: currentUserID,
                    authkey: accessToken
                }).save(function(err, data){
                    if(err){
                        console.log(err);
                    }
                });
            }
            checkinFoursquare(accessToken);
            res.end();
        }
    });
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

var serialPort = new com.SerialPort("/dev/cu.usbmodem1421", {
    baudrate: 9600,
    parser: com.parsers.readline('\n')
});

serialPort.on('open', function() {
    console.log('Everything is alive!');
});

serialPort.on('data', function(data){
    data = data.split(' ').join('').replace(/(\r\n|\n|\r)/gm,"");
    console.log(data);
    io.sockets.on('connection', function(socket) {
        key.find(function (err, currentData){
          if(err){
            currentUserID = data;
            console.log("Try login first!");
          } else {
            currentUserID = -1;
          }
        })
        socket.emit('checkinsuccessful', { num: 2 });
    });
});
