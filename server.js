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
            console.log(accessToken);
        }
    });
});

app.listen(3000);
