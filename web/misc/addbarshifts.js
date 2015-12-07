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

function buildQueries() {
    var ret = [];
    var proto = "INSERT INTO shifts (bar, start, stop, description) VALUES ({0}, TIMESTAMP '{1}', TIMESTAMP '{2}', '{3}');";

    var shiftTimes = {
        1: { // Lyche
                0: [{ start: '15:00', stop: '22:00', description: '' }],      // Søndag
                1: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Mandag
                    { start: '17:00', stop: '00:00', description: 'Sent' }],  // Mandag
                2: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Tirsdag
                    { start: '17:00', stop: '00:00', description: 'Sent' }],  // Tirsdag
                3: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Onsdag
                    { start: '17:00', stop: '00:00', description: 'Sent' }],  // Onsdag
                4: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Torsdag
                    { start: '17:00', stop: '00:00', description: 'Sent' }],  // Torsdag
                5: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Fredag
                    { start: '20:00', stop: '03:00', description: 'Sent' }],  // Fredag
                6: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Lørdag
                    { start: '20:00', stop: '03:00', description: 'Sent' }]   // Lørdag
            },
        2: { // Edgar
                0: [{ start: '15:00', stop: '22:00', description: '' }],      // Søndag
                1: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Mandag
                    { start: '17:00', stop: '00:00', description: 'Sent' }],  // Mandag
                2: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Tirsdag
                    { start: '17:00', stop: '00:00', description: 'Sent' }],  // Tirsdag
                3: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Onsdag
                    { start: '19:00', stop: '02:00', description: 'Sent' }],  // Onsdag
                4: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Torsdag
                    { start: '19:00', stop: '02:00', description: 'Sent' }],  // Torsdag
                5: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Fredag
                    { start: '20:00', stop: '03:00', description: 'Sent' }],  // Fredag
                6: [{ start: '15:00', stop: '22:00', description: 'Tidlig' }, // Lørdag
                    { start: '20:00', stop: '03:00', description: 'Sent' }]   // Lørdag
            },
        3: { // Daglighallen
                0: [{ start: '15:00', stop: '22:00', description: '' }],  // Søndag
                1: [{ start: '19:00', stop: '00:00', description: '' }],  // Mandag
                2: [{ start: '19:00', stop: '00:00', description: '' }],  // Tirsdag
                3: [{ start: '19:00', stop: '00:00', description: '' }],  // Onsdag
                4: [{ start: '19:00', stop: '02:00', description: '' }],  // Torsdag
                5: [{ start: '20:00', stop: '02:30', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '02:30', description: '' }]   // Lørdag
            },
        4: { // Rundhallen
                0: [],                                                    // Søndag
                1: [],                                                    // Mandag
                2: [],                                                    // Tirsdag
                3: [],                                                    // Onsdag
                4: [],                                                    // Torsdag
                5: [{ start: '20:00', stop: '03:00', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '03:00', description: '' }]   // Lørdag
            },
        5: { // Klubben
                0: [],                                                    // Søndag
                1: [],                                                    // Mandag
                2: [],                                                    // Tirsdag
                3: [],                                                    // Onsdag
                4: [{ start: '19:00', stop: '02:00', description: '' }],  // Torsdag
                5: [{ start: '20:00', stop: '03:00', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '03:00', description: '' }]   // Lørdag
            },
        6: { // Bodegaen
                0: [],                                                    // Søndag
                1: [],                                                    // Mandag
                2: [],                                                    // Tirsdag
                3: [],                                                    // Onsdag
                4: [],                                                    // Torsdag
                5: [{ start: '20:00', stop: '03:00', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '03:00', description: '' }]   // Lørdag
            },
        7: { // Storsalen Syd
                0: [],                                                    // Søndag
                1: [],                                                    // Mandag
                2: [],                                                    // Tirsdag
                3: [],                                                    // Onsdag
                4: [],                                                    // Torsdag
                5: [{ start: '20:00', stop: '03:00', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '03:00', description: '' }]   // Lørdag
            },
        8: { // Storsalen Nord
                0: [],                                                    // Søndag
                1: [],                                                    // Mandag
                2: [],                                                    // Tirsdag
                3: [],                                                    // Onsdag
                4: [],                                                    // Torsdag
                5: [{ start: '20:00', stop: '03:00', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '03:00', description: '' }]   // Lørdag
            },
        9: { // Strossa
                0: [],                                                    // Søndag
                1: [],                                                    // Mandag
                2: [],                                                    // Tirsdag
                3: [],                                                    // Onsdag
                4: [],                                                    // Torsdag
                5: [{ start: '20:00', stop: '03:00', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '03:00', description: '' }]   // Lørdag
            },
        10: { // Selskapssiden
                0: [],                                                    // Søndag
                1: [],                                                    // Mandag
                2: [],                                                    // Tirsdag
                3: [],                                                    // Onsdag
                4: [],                                                    // Torsdag
                5: [{ start: '20:00', stop: '03:00', description: '' }],  // Fredag
                6: [{ start: '20:00', stop: '03:00', description: '' }]   // Lørdag
            },
    };

    var date = moment("2015-11-28"); // Date to add from
    for (var i = 0; i < 30; ++i) {

        for (var bar = 1; bar <= 10; ++bar) { // Iterate through bars by id
            var tms = shiftTimes[bar][date.day()]; // All shifts for this bar at this day
            for (var tm = 0; tm < tms.length; ++tm) { // Iterate through shifts and add them to return-array
                var shift = tms[tm];

                var startHour = Number(shift.start.split(':')[0]);
                var startMinute = Number(shift.start.split(':')[1]);
                var stopHour = Number(shift.stop.split(':')[0]);
                var stopMinute = Number(shift.stop.split(':')[1]);

                var timeStart = moment(date).hour(startHour).minute(startMinute);
                var timeStop = moment(date).hour(stopHour).minute(stopMinute);

                if (timeStop.isBefore(timeStart))
                    timeStop.add(1, 'days');

                var timeStartFormatted = timeStart.format('YYYY-MM-DD HH:mm:00');
                var timeStopFormatted = timeStop.format('YYYY-MM-DD HH:mm:00');

                ret.push(proto.format(bar, timeStartFormatted, timeStopFormatted, shift.description));
            }
        }

        date.add(1, 'days');
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
                console.log(err);
            else
                console.log(result);
        });
    }
});