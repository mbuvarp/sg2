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
                    ['us.role_id', 'user_shift_role_id'],
                    ['us.start', 'user_shift_start'],
                    ['us.finish', 'user_shift_finish'],
                    ['s.id', 'shift_id'],
                    ['s.start', 'shift_start'],
                    ['s.finish', 'shift_finish'],
                    ['s.description', 'shift_description'],
                    ['s.type_id', 'shift_type_id'],
                    ['u.id', 'user_id'],
                    ['u.name', 'user_name'],
                    ['u.image', 'user_image'],
                    ['r.id', 'role_id'],
                    ['r.name', 'role_name'],
                    ['st.id', 'shift_type_id'],
                    ['st.name', 'shift_type_name']
                ],
        from:   [
                    ['users', 'u'],
                    ['shifts', 's'],
                    ['user_shifts', 'us'],
                    ['workplaces', 'w'],
                    ['roles', 'r'],
                    ['shift_types', 'st']
                ],
        where:  [
                    { left: 'us.shift_id', right: 's.id', comparator: COMPARATOR.EQUALS },
                    { left: 'us.user_id', right: 'u.id', comparator: COMPARATOR.EQUALS },
                    { left: 's.bar_id', right: 'w.id', comparator: COMPARATOR.EQUALS },
                    { left: 'us.role_id', right: 'r.id', comparator: COMPARATOR.EQUALS },
                    { left: 's.type_id', right: 'st.id', comparator: COMPARATOR.EQUALS }
                ]
    };
    if (date !== '-')
        params.where.push({ left: 'DATE(s.start)', right: 'DATE(\'' + date + '\')', comparator: COMPARATOR.EQUALS });

    var qry = buildQuery(params);
    return query(qry);
}
exports.getUserShift = function(id) {
    var params =
    {
        statement: STATEMENT.SELECT,
        fields: [
                    ['u.id', 'uid'],
                    ['u.name', 'name'],
                    ['u.image', 'image'],
                    ['r.name', 'role'],
                    ['us.role_id', 'roleid'],
                    ['us.start', 'start'],
                    ['us.finish', 'finish'],
                    ['us.id', 'usershiftid'],
                ],
        from:   [
                    ['users', 'u'],
                    ['user_shifts', 'us'],
                    ['roles', 'r']
                ],
        where:  [
                    { left: 'us.id', right: id, comparator: COMPARATOR.EQUALS },
                    { left: 'us.user_id', right: 'u.id', comparator: COMPARATOR.EQUALS },
                    { left: 'us.role_id', right: 'r.id', comparator: COMPARATOR.EQUALS }
                ]
    };
    var qry = buildQuery(params);
    return query(qry);
}
exports.getRoles = function() {
    return query('SELECT * FROM roles ORDER BY id ASC;');
}
exports.getAffiliations = function() {
    return query('SELECT * FROM affiliations ORDER BY name ASC;');
}
exports.getUserAffiliations = function() {
    return query('SELECT id AS user_id, name, image, affiliation_id FROM users ORDER BY id ASC;');
}

exports.updateUserShift = function(user_id, user_shift_id, role_id, start, finish) {
    var proto = 'UPDATE user_shifts SET role_id={0}, start=TIMESTAMP \'{1}\', finish=TIMESTAMP \'{2}\' WHERE id={3} AND user_id={4};';
    var qry = proto.format(role_id, start, finish, user_shift_id, user_id);
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