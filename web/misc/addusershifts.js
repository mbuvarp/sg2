var pg = require('pg');
var q = require('q');

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

    var proto = "INSERT INTO user_shifts (shift_id, user_id, role_id) VALUES ({0}, {1}, {2});";

    var r = function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Total shifts in shifts
    var shiftsTotal = 202;
    for (var shift = 1; shift <= shiftsTotal; ++shift) { // Iterate through shifts by id
        for (var i = 0; i < 4; ++i) {
            var user = r(1, 151);
            getRole(i === 0 ? shift : '-1')
            .then(
                function(result) {
                    console.log(result);
                    ret.push(proto.format(shift, user, result));
                },
                function(err) {
                    console.log(err);
                }
            );
        }
    }

    return ret;
}

var queries = buildQueries();

var conString = 'postgres://postgres:pass@localhost/sgvaktsys';
// pg.connect(conString, function(err, client, done) {
//     if (err) {
//         console.log(err);
//         done();
//         return;
//     }

//     for (var q = 0; q < queries.length; ++q) {
//         var query = queries[q];

//         client.query(query, function(err, result) {
//             done();
//             if (err)
//                 console.log(q, err);
//             else
//                 console.log(q, result);
//         });
//     }
// });

function getRole(id) {
    var defer = q.defer();
    if (id === -1)
        defer.resolve('Gjengis');
    else
        pg.connect(conString, function(err, client, done) {
            var query = 'SELECT bar_id FROM shifts WHERE id=' + id + ';';
            console.log(err);
            client.query(query, function(err, result) {
                done();
                if (err)
                    defer.reject(err);
                else
                    defer.resolve(result);
            });
        });
    return defer.promise;
}