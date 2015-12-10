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

    var proto = "INSERT INTO user_workplaces (user_id, workplace_id, since) VALUES ({0}, {1}, '{2}');";

    var r = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Total shifts in shifts
    var semesters = ['V12', 'H12', 'V13', 'H13', 'V14', 'H14', 'V15', 'H15'];
    var usersTotal = 150;
    for (var user = 1; user <= usersTotal; ++user) { // Iterate through shifts by id
        var workplace = Math.ceil(user / 15);
        var since = semesters[r(0, semesters.length)];
        ret.push(proto.format(user, workplace, since));
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