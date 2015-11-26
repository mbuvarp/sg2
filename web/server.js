// Imports
var express = require('express');
var app = express();

// Define constants
const PORT = 8080;

// Options
var defaultOptions = {
    root: __dirname + '/public/',
};
app.use(express.static('public'));

// Routing
app.get('/', function(req, res) {
    res.sendFile('index.html', defaultOptions, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else
            console.log('Sent: ', fileName);
    });
});

// Create server and listen
var server = app.listen(PORT, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening on http://%s:%s', host, port);
});