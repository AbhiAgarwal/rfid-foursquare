/*
- backend: node.js, arduino, foursquare, mongo
- frontend: angularjs, jquery
*/

// Foursquare
var config = {
  'secrets' : {
    'clientId' : '=',
    'clientSecret' : '',
    'redirectUrl' : ''
  }
};
var foursquare = require('node-foursquare')(config);

// Checkin Done
var checkinDone = false;

// Express
var express = require('express');
var app = express();

// HTTP
var http = require('http');
var path = require('path');

// Serial Port from Arduino
var com = require("serialport");

var currentToken = '';

// Read File
var fs = require("fs");

var placeID = [/* Maoz: */'4a15c43af964a520ce781fe3', /* Courant: */'4ac3bac3f964a520969c20e3'];

var checkinFoursquare = function(accessToken, place){
    foursquare.Checkins.addCheckin(place, {}, accessToken, function(){
        console.log("Checkin Confirmed!");
        io.sockets.on('connection', function(socket){
            socket.emit('checkinsuccessful', {
                num: 1
            });
        });
        // The user has been registered now
        console.log("Your user has been checked in!");
    });
};

// User Registration
var hasUserRegistered = function(id){
    var idExists = false;
    if(fs.existsSync(__dirname + '/id/' + id + '.txt')){
        idExists = true;
    }
    if(idExists){
        // User has registered
        return 1;
    } else {
        // User has not registered
        return -1;
    }
};

// Registration is happening here - put it into mongo, etc.
var registerUser = function(id, authToken){
    fs.writeFile(__dirname + '/id/' + id + '.txt', authToken, function(err){
        if(err) {
            console.log(err);
        } else {
            io.sockets.on('connection', function(socket){
                socket.emit('checkinsuccessful', {
                    num: 4
                });
            });
            io.sockets.on('connection', function(socket){
                socket.emit('checkinsuccessful', {
                    num: 6
                });
            });
            console.log("Your user has been registered!");
        }
    });
    return 0;
};

// The user is registered so I want to do it
var getUserAuthToken = function(id){
    var text = fs.readFileSync(__dirname + '/id/' + id + '.txt','utf8');
    return text;
};

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

app.get('/simulate1', function(req, res){
    cardRead('E5F9D2B\r\n');
    res.end();
});

app.get('/simulate2', function(req, res){
    cardRead('E5E9D2B\r\n');
    res.end();
});

app.get('/simulate3', function(req, res){
    cardRead('453927AA52B8\r\n');
    res.end();
});

app.get('/callback', function(req, res){
    foursquare.getAccessToken({
        code: req.query.code
    }, function(error, accessToken){
        if(error){
            res.send('An error was thrown: ' + error.message);
        } else {
            registerUser(currentToken, accessToken);
            res.writeHead(301, {
                    Location: 'http://lvh.me:3000/'
                }
            );
            res.end();
        }
    });
});

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

var serialPort = new com.SerialPort("/dev/cu.usbmodem1411", {
    baudrate: 9600,
    parser: com.parsers.readline('\n\n')
});

serialPort.on('open', function(){
    console.log('Everything is alive!');
});

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var cardRead = function(data){
    data = data.split(' ').join('').replace(/(\r\n|\n|\r)/gm,"").replace(/0/g, "").replace(/x/g, "");
    console.log("Card " + data + " has been connected");
    io.sockets.on('connection', function(socket){
        socket.emit('checkinsuccessful', {
            num: 2
        });
    });
    // The card has been detected
    // Check if the card is registered or not
    if(data.length == 7 || data.length == 12){
        if(hasUserRegistered(data) == 1){
            var currentOAuthToken = getUserAuthToken(data);
            console.log(currentOAuthToken);
            checkinFoursquare(currentOAuthToken, placeID[1]);
        } else {
            console.log("Please navigate to http://localhost:3000/login and get your OAuth token");
            io.sockets.on('connection', function(socket){
                socket.emit('checkinsuccessful', {
                    num: 3
                });
            });
            currentToken = data;
            // Read
            /*
            rl.question("What is your OAuth Token? ", function(answer){
                tokenApplication = answer; // Get the Token
                rl.close();
                registerUser(data, tokenApplication);
            });
            */
        }
    } else {
        io.sockets.on('connection', function(socket){
                socket.emit('checkinsuccessful', {
                    num: 5
                });
            });
        console.log("Please tap your card again!");
    }
};

var simulateEvent = function(){
    cardRead('E5F9D2B\r\n');
};

process.argv.forEach(function (val, index, array) {
  if(val == 'simulate'){
    simulateEvent();
  }
});
