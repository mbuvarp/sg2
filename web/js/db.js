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

var moment = require('moment');
var pg = require('pg');
var q = require('q');

var conString = 'postgres://postgres:pass@localhost/sgvaktsys';

function query(query) {
    var defer = q.defer();

    pg.connect(conString,
        function(error, client, done) {
            if (error)
                return console.error('DB: Error fetching client from pool', error);
            client.query(query,
                function(error, result) {
                    done()
                    if (error) {
                        defer.reject(error);
                        return console.error('DB: Query error', error);
                    }
                    defer.resolve(result.rows);
                }
            );
        }
    );

    return defer.promise;
}

exports.getAllBars = function() {
    return query('SELECT * FROM bars ORDER BY name ASC');
}
exports.getShifts = function(date) {
    var qry = 'SELECT bars.name AS bar, bar_shifts.start, bar_shifts.finish, bar_shifts.description, ' +
                'users.id AS user_id, users.name, users.image, user_shifts.role ' +
                'FROM bars, user_shifts, bar_shifts, users ' +
                'WHERE user_shifts.bar_shift_id = bar_shifts.id ' +
                'AND user_shifts.user_id = users.id ' +
                'AND bars.id = bar_shifts.bar_id' +
                (date !== '-' ? ' AND DATE(bar_shifts.start)=DATE(\'' + date + '\');' : ';');

    return query(qry);
}

exports.verifyUser = function(user, pass) {
    var qry = 'SELECT id, role FROM users WHERE email=\'{0}\' AND pass=\'{1}\''
        .format(user, pass);

    var defer = q.defer();

    query(qry)
    .then(
        function(result) {
            if (result.length === 1)
                defer.resolve(result[0]);
            else
                defer.reject(null);
        },
        function(error) {
            defer.reject(error);
        }
    );

    return defer.promise;
}