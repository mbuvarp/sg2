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

function randomName() {
    var f = ['Olga', 'Joar', 'Heimdal', 'Thor', 'Lars',
             'Magnus', 'Tormod', 'Jon', 'Alice', 'Ivar',
             'Steffen', 'Stian', 'Kirsti', 'Mari', 'Tuva',
             'Nina', 'Christine', 'Petter', 'Jonas', 'Thea',
             'Karen', 'Stine', 'Lilli', 'Aslak', 'Kristoffer',
             'Håkon', 'Brit', 'Michelle', 'Anna', 'Haakon',
             'Sine', 'Frida', 'Tony', 'Espen', 'Michael',
             'Sigrid', 'Odin', 'Captain', 'Iron', 'Julie'];
    var l = ['Buvarp', 'Haugland', 'Zakova', 'Zwaig', 'Eriksen',
             'Holmås', 'Hauge', 'Sørbotten', 'Claudi', 'Misund',
             'Nybakk', 'Bay', 'Stordalen', 'Gay', 'Guttormsen',
             'Hansen', 'Likhus', 'Promp', 'Tullball', 'Winchester',
             'Sandvik', 'Johansson', 'Steinsrud', 'Lyche', 'Jackson',
             'Bush', 'Obama', 'Carter', 'Reagan', 'Kennedy'];
    var randInt = function(max) { return Math.floor(Math.random() * max); };
    return f[randInt(f.length)] + ' ' + l[randInt(l.length)];
}
function emailFromName(name) {
    return name.split(' ')[0].toLowerCase() + '.' + name.split(' ')[1].toLowerCase() + '@gmail.com';
}

function buildQueries() {
    var ret = [];
    var proto = "INSERT INTO users (email, pass, role, name) VALUES ('{0}', '{1}', '{2}', '{3}');";

    for (var i = 0; i < 150; ++i) {
        var name = randomName();
        var email = emailFromName(name);
        //var created = moment().format('YYYY-MM-DD HH:mm:ss');
        if (i === 0)
            ret.push(proto.format('magnusb.93@gmail.com', 'pass', 'admin', 'Magnus Buvarp'));
        else
            ret.push(proto.format(email, 'pass', 'user', name));
    }

    return ret;
}

var queries = buildQueries();

var conString = 'postgres://postgres:pass@localhost/sgvaktsys';
// for (var q = 0; q < queries.length; ++q) {
//     console.log(queries[q]);
// }
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
                console.log(err);
            else
                console.log(result);
        });
    }
});