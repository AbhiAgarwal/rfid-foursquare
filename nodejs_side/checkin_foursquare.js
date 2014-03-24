/* Courant: 4ac3bac3f964a520969c20e3, Maoz: 4a15c43af964a520ce781fe3 */
var placeID = '4a15c43af964a520ce781fe3';

var checkinFoursquare = function(accessToken, place){
    foursquare.Checkins.addCheckin(placeID, {}, accessToken, function(){
        console.log("Checkin Confirmed!");
        io.sockets.on('connection', function(socket){
            socket.emit('checkinsuccessful', {
                num: 1
            });
        });
    });
};

checkinFoursquare(accessToken, placeID);
