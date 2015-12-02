var pg = require('pg');

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

function buildQueries() {
    var ret = [];

    var proto = "INSERT INTO shifts (bar_shift, user_id, role) VALUES ({0}, {1}, '{2}');";

    var r = function() {
        var min = 1;
        var max = 11;
        return Math.floor(Math.random() * (max - min)) + min;
    }

    var shiftsTotal = 228;
    for (var shift = 1; shift <= shiftsTotal; ++shift) { // Iterate through shifts by id
        for (var i = 0; i < 4; ++i) {
            var user = r();
            var role = i === 0 ? "Funk" : "Gjengis";
            ret.push(proto.format(shift, user, role));
        }
    }

    return ret;
}

var queries = buildQueries();

var conString = 'postgres://postgres:pass@localhost/sgvaktsys';
pg.connect(conString, function(err, client, done) {
    if (err) {
        console.log(err);
        done();
        return;
    }

    for (var q = 0; q < queries.length; ++q) {
        var query = queries[q];

        client.query(query, function(err, result) {
            done();
            if (err)
                console.log(q, err);
            else
                console.log(q, result);
        });
    }
});