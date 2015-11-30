// Imports
var express = require('express');
var app = express();
var pg = require('pg');
var moment = require('moment');

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

// POSTGRES
var conString = 'postgres://postgres:pass@localhost/sgvaktsys';
function sendQuery(query, callback) {
    pg.connect(conString, function(err, client, done) {
        if (err) {
            console.log(err);
            done();
            return;
        }

        var q = client.query(query, function(err, result) {
            done();
            if (err)
                console.log(err);
            else
                callback(result.rows);
        });
    });
}

// API routing
app.get('/api/bars', function(req, res) {
    console.log("GET %s", req.path);

    sendQuery('SELECT * FROM bars ORDER BY name ASC;', function(result) {
        res.json(result);
    });
});
app.get('/api/shifts/:date', function(req, res) {
    console.log("GET %s", req.path);

    var fixDate = function(date) {
        var validDate = function(date) {
            return moment(date).isValid();
        }

        if (date === '-')
            return '-';
        if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))
            return validDate(date) ? date : 'ERR::Invalid date: date does not exist';
        else if (!(/^[0-9]{4}-[0-9]+-[0-9]+$/.test(date)))
            return 'ERR::Syntax error: use format YYYY-MM-DD';
        else {
            var y = date.split('-')[0];
            var m = date.split('-')[1];
            var d = date.split('-')[2];

            if (y.length != 4)
                return 'ERR::Syntax error: use format YYYY-MM-DD';
            if (m.length === 1)
                m = '0' + m;
            if (d.length === 1)
                d = '0' + d;

            var formatted = '{0}-{1}-{2}'.format(y, m, d);

            return validDate(formatted) ? formatted : 'ERR::Invalid date: date does not exist';
        }
    };

    var date = fixDate(req.params.date);
    if (date.substring(0, 5) == 'ERR::') {
        res.send(date.split('::')[1]);
        return;
    }

    var query = 'SELECT bars.name AS bar, start, stop, bar_shifts.description, ' +
                'users.id AS user_id, users.name, users.image, shifts.role ' +
                'FROM bars, shifts, bar_shifts, users ' +
                'WHERE shifts.bar_shift_id = bar_shifts.id ' +
                'AND shifts.user_id = users.id ' +
                'AND bars.id = bar_shifts.bar_id' +
                (date !== '-' ? ' AND DATE(bar_shifts.start)=DATE(\'' + date + '\');' : ';');
    sendQuery(query,
        function(result) {
            var ret = {};
            for (var r = 0; r < result.length; ++r) {
                var curRes = result[r];

                if (ret[curRes.bar] == undefined)
                    ret[curRes.bar] = [];

                ret[curRes.bar].push({
                    user_id: Number(curRes.user_id),
                    name: curRes.name,
                    image: curRes.image,
                    role: curRes.role,
                    start: curRes.start,
                    stop: curRes.stop,
                    description: curRes.description
                });
            }
            res.json(ret);
        }
    );
});

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
app.get('/', function(req, res) {
    console.log("GET %s", req.path);
    send(res, __dirname + '/public/index.html');
});
app.get('/vaktsys', function(req, res) {
    console.log("GET %s", req.path);
    send(res, __dirname + '/public/subpages/vaktsys.html');
});

// Create server and listen
var server = app.listen(PORT, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening on http://%s:%s', host, port);
});

// Options
app.use(express.static('public'));