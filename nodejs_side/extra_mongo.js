// MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fsqarduino');
var db = mongoose.connection;
var keySchema = mongoose.Schema({
    name: String,
    authkey: String
});
var Key = mongoose.model('key', keySchema);

// What is the current HEX
var currentUserID = '';

var checkInDatabase = function(data){
    var query = Key.findOne({ name : data }, 'name authkey', function(err, auth){
        if(err){
            console.log("Error");
        } else {
            console.log(auth);
        }
    });
};

