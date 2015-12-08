// Imports
var q = require('q');
var moment = require('moment');
var db = require('./db');
var jwt = require('./jwt');

const VERIFY_ALL = true;

function verifyAndRefreshJwt(jwtToken) {
    var defer = q.defer();

    if (jwtToken === undefined && VERIFY_ALL)
        defer.resolve('meh');
    else
        jwt.verify(jwtToken, function(token) {
            // Success
            defer.resolve(token);
        }, function(err) {
            // Error
            // TODO: session timeout
            defer.reject(err);
        });

    return defer.promise;
}

function getShifts(req, res) {

    // Function to fix errors in date syntax
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

    db.getShifts(date)
    .then(function(data) {
        // Organize json response in my own way
        var ret = {};
        for (var r = 0; r < data.length; ++r) {
            var curRes = data[r];

            if (ret[curRes.workplace_name] == undefined)
                ret[curRes.workplace_name] = [];

            ret[curRes.workplace_name].push({
                user_id: Number(curRes.user_id),
                shift_id: Number(curRes.shift_id),
                user_shift_id: Number(curRes.user_shift_id),
                user_name: curRes.user_name,
                image: curRes.image,
                role: curRes.role,
                start: curRes.user_shift_start || curRes.shift_start,
                finish: curRes.user_shift_finish || curRes.shift_finish,
                description: curRes.description
            });
        }
        
        res.json(ret).end(200);
    }, function(err, status) {
        console.log(err);
        res.send(err);
    });
}
function getWorkplaces(req, res) {
    db.getAllWorkplaces()
    .then(function(data) {
        res.status(200).json(data);
    }, function(err, status) {
        console.log(err);
        res.status(status || 400).send(err);
    });
}

function login(req, res) {
    return db.verifyUser(req.body.username, req.body.password);
}

// This is just for testing different stuff
function test(req, res) {
    db.test()
    .then(
        function(data) {
            res.status(200).json(data);
        },
        function(err) {
            console.log(err);
            res.status(status || 400).send(err);
        }
    );
}

exports.run = function(app) {

    // API Get
    app.get('/api/workplaces',
        function(req, res) {
            console.log("GET %s", req.path);
            getWorkplaces(req, res);
        }
    );
    app.get('/api/shifts/:date',
        function(req, res) {
            console.log("GET %s", req.path);
            
            // Get jwt
            var jwtToken = req.headers.authorization;
            if (jwtToken && jwtToken.indexOf('Bearer ') != -1)
                jwtToken = jwtToken.split(' ')[1];
            
            // Verify token
            verifyAndRefreshJwt(jwtToken)
            .then(
                function(newToken) {
                    // Valid token
                    res.set('Authorization', 'Bearer ' + newToken);
                    getShifts(req, res);
                }, function(err) {
                    // Invalid token - send 401
                    console.log(err);
                    res.status(401).end();
                }
            );
        }
    );

    app.get('/api/test', 
        function(req, res) {
            console.log("GET %s", req.path);
            test(req, res);
        }
    );

    // API Post
    app.post('/api/login',
        function(req, res) {
            console.log("POST %s", req.path);
            login(req, res)
            .then(
                function(data) {
                    var jwtToken = jwt.token(data.id, data.role);
                    res.status(200).json({ success: true, jwtToken: jwtToken });
                }, function(err) {
                    res.status(401).json({ success: false, jwtToken: null });
                }
            );
        }
    );

}