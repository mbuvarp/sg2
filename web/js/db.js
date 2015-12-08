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
const COMPARATOR = {
    EQUALS: '=',
};
function buildQuery(params) {
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
        ret += where.left + ' ' + where.comparator + ' ' + where.right;
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
            ['w.name', 'workplace_name']
        ],
        from: [
            ['users', 'u'],
            ['bar_shifts', 'bs'],
            ['user_shifts', 'us'],
            ['workplaces', 'w']
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

exports.getAllWorkplaces = function() {
    return query('SELECT * FROM workplaces ORDER BY name ASC;');
}
exports.getShifts = function(date, user) {
    
    var params =
    {
        statement: STATEMENT.SELECT,
        fields: [
                    ['w.name', 'workplace_name'],
                    ['us.id', 'user_shift_id'],
                    'us.role',
                    ['us.start', 'user_shift_start'],
                    ['us.finish', 'user_shift_finish'],
                    ['s.id', 'shift_id'],
                    ['s.start', 'shift_start'],
                    ['s.finish', 'shift_finish'],
                    's.description',
                    ['u.id', 'user_id'],
                    ['u.name', 'user_name'],
                    'u.image'
                ],
        from:   [
                    ['users', 'u'],
                    ['shifts', 's'],
                    ['user_shifts', 'us'],
                    ['workplaces', 'w']
                ],
        where:  [
                    { left: 'us.shift_id', right: 's.id', comparator: COMPARATOR.EQUALS },
                    { left: 'us.user_id', right: 'u.id', comparator: COMPARATOR.EQUALS },
                    { left: 's.bar_id', right: 'w.id', comparator: COMPARATOR.EQUALS }
                ]
    };
    if (date !== '-')
        params.where.push({ left: 'DATE(s.start)', right: 'DATE(\'' + date + '\')', comparator: COMPARATOR.EQUALS });

    var qry = buildQuery(params);
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