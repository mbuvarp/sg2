// Imports
var express = require('express');
var app = express();
var api = require('./api');

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}

// Define constants
const PORT = 8080;

// API routing
app.get('/api/bars', function(req, res) {
    console.log("GET %s", req.path);
    api.getBars(req, res);
});
app.get('/api/shifts/:date', function(req, res) {
    console.log("GET %s", req.path);
    api.getShifts(req, res);
});

// Options
app.use('/', express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/libs', express.static(__dirname + '/public/libs'));
app.use('/style', express.static(__dirname + '/public/style'));
app.use('/includes', express.static(__dirname + '/public/includes'));
app.use('/views', express.static(__dirname + '/public/partials'));

// Web routing
function send(res, path) {
    res.sendFile(path, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            res.status(200).end();
        }
    });
}
// Getters
app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    console.log("GET %s", req.path);
    send(res, __dirname + '/public/index.html');
});

// Create server and listen
var server = app.listen(PORT, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening on http://%s:%s', host, port);
});
