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

const STATEMENT = {
    SELECT: 'SELECT',
    INSERT: 'INSERT',
    UPDATE: 'UPDATE'
};
const COMPARITOR = {
    EQUALS: '=',
};
function buildQuery(params) {
    // Example param
    // var params = {
    //     statement: STATEMENT.SELECT,
    //     fields: [
    //         ['u.id', 'user_id'],
    //         ['bs.id', 'bar_shift_id'],
    //         ['us.id', 'user_shift_id'],
    //         ['u.name', 'user_name'],
    //         ['us.role', 'user_role'],
    //         ['b.name', 'bar_name']
    //     ],
    //     from: [
    //         ['users', 'u'],
    //         ['bar_shifts', 'bs'],
    //         ['user_shifts', 'us'],
    //         ['bars', 'b']
    //     ],
    //     where: [
    //         {
    //             left: 'u.id',
    //             right: 'us.user_id',
    //             comparitor: COMPARITOR.EQUALS
    //         },
    //         {
    //             left: 'us.bar_shift_id',
    //             right: 'bs.id',
    //             comparitor: COMPARITOR.EQUALS
    //         },
    //         {
    //             left: 'u.id',
    //             right: '1',
    //             comparitor: COMPARITOR.EQUALS
    //         },
    //         {
    //             left: 'bs.bar_id',
    //             right: 'b.id',
    //             comparitor: COMPARITOR.EQUALS
    //         },
    //         {
    //             left: 'DATE(bs.start)',
    //             right: 'DATE(\'2015-12-07\')',
    //             comparitor: COMPARITOR.EQUALS
    //         }
    //     ]
    // };

    var ret = '';
    ret += params.statement + ' ';

    for (var i in params.fields) {
        var field = params.fields[i];

        if (field instanceof Array)
            ret += field[0] + ' AS ' + field[1];
        else
            ret += field;

        ret += i < (params.fields.length - 1) ? ', ' : ' ';
    }

    ret += 'FROM ';
    for (var i in params.from) {
        var from = params.from[i];

        if (from instanceof Array)
            ret += from[0] + ' AS ' + from[1];
        else
            ret += from;

        ret += i < (params.from.length - 1) ? ', ' : ' ';
    }

    ret += (params.where.length > 0 ? 'WHERE ' : '');
    for (var i in params.where) {
        var where = params.where[i];
        ret += where.left + ' ' + where.comparitor + ' ' + where.right;
        ret += i < (params.where.length - 1) ? ' AND ' : ' ';
    }

    return ret + ';';
}
// This is just for testing different stuff
exports.test = function() {
    var params = {
        statement: STATEMENT.SELECT,
        fields: [
            ['u.id', 'user_id'],
            ['bs.id', 'bar_shift_id'],
            ['us.id', 'user_shift_id'],
            ['u.name', 'user_name'],
            ['us.role', 'user_role'],
            ['b.name', 'bar_name']
        ],
        from: [
            ['users', 'u'],
            ['bar_shifts', 'bs'],
            ['user_shifts', 'us'],
            ['bars', 'b']
        ],
    }
    console.log(buildQuery(params));
    return query(buildQuery(params));
};

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
exports.getShifts = function(date, user) {
    var qry = 'SELECT bars.name AS bar, bar_shifts.id AS bar_shift_id, user_shifts.id AS user_shift_id, bar_shifts.start, bar_shifts.finish, bar_shifts.description, ' +
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