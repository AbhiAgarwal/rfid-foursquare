// Foursquare
var config = {
  'secrets' : {
    'clientId' : 'S0RJ4K5GPCNXAXZBYN3ZNOFIRQGS0KEP0VOMQKFNW1HC4HIR',
    'clientSecret' : 'KFCLE3FRJX05HACKRNFWSADFU5UXGGQJQYUGFKQEBGQ2VY4Y',
    'redirectUrl' : 'http://lvh.me:3000/callback'
  }
};
var foursquare = require('node-foursquare')(config);

// Express
var express = require('express');
var app = express();

// HTTP
var http = require('http');
var path = require('path');

// Serial Port from Arduino
var com = require("serialport");

var placeID = [/* Maoz: */'4a15c43af964a520ce781fe3', /* Courant: */'4ac3bac3f964a520969c20e3'];

var checkinFoursquare = function(accessToken, place){
    foursquare.Checkins.addCheckin(place, {}, accessToken, function(){
        console.log("Checkin Confirmed!");
        io.sockets.on('connection', function(socket){
            socket.emit('checkinsuccessful', {
                num: 1
            });
        });
    });
};

// User Registration
var hasUserRegistered = function(id){
    if(id){
        // User has registered
        return 1;
    } else {
        // User has not registered
        return -1;
    }
};

// Registration is happening here - put it into mongo, etc.
var registerUser = function(id, authToken){
    return 0;
};

// The user is registered so I want to do it
var getUserAuthToken = function(id){
    return 0;
}

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.render('index', {
        titlewhole: 'Foursquare Checkin Status',
        title: 'Please use your RFID/NFC card on the device'
    });
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
    parser: com.parsers.readline('\n\n')
});

serialPort.on('open', function(){
    console.log('Everything is alive!');
});

serialPort.on('data', function(data){
    data = data.split(' ').join('').replace(/(\r\n|\n|\r)/gm,"").replace(/0/g, "").replace(/x/g, "");
    console.log("Card " + data + " has been connected");
    // The card has been detected
    // Check if the card is registered or not
    if(hasUserRegistered(data) == 1){
        var currentOAuthToken = getUserAuthToken(data);
        checkinFoursquare(currentOAuthToken, placeID[1]);
    } else {
        console.log("Please navigate to http://localhost:3000/login and get your OAuth token");
        // Get the Token
        registerUser(data, tokenApplication);
        // The user has been registered now
        console.log("Your user has been registered");
        console.log("Please tap your card again!");
    }
    io.sockets.on('connection', function(socket){
        socket.emit('checkinsuccessful', {
            num: 2
        });
    });
});
