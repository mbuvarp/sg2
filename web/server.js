// Imports
var express = require('express');
var bodyParser = require('body-parser');
var api = require('./js/api');

var app = express();
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

api.run(app);

// Define constants
const PORT = 8080;

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

process.on('SIGINT', function() {
    console.log('\r  \nbye')
    process.exit();
});