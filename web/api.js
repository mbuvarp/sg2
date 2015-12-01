// Imports
var moment = require('moment');
var db = require('./db');

exports.getShifts = function(req, res) {
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

        res.json(ret).end(200);
    }, function(err, status) {
        console.log(err);
        res.send(err);
    });
}
exports.getBars = function(req, res) {
    db.getAllBars()
    .then(function(data) {
        res.status(200).json(data);
    }, function(err, status) {
        console.log(err);
        res.status(status || 400).send(err);
    });
    // db.sendQuery('SELECT * FROM bars ORDER BY name ASC;', function(result) {
    //     res.json(result);
    // });
}