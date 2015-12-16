"use strict";

app

.service('vaktsysService', ['$http', 'datesliderService', '$q',
    function($http, datesliderService, $q) {

        this.retrieveWorkplaces = function() {
            var defer = $q.defer();
            $http.get('/api/workplaces').then(
                // Success
                function(data) {
                    var workplaces = {
                        curWorkplace: "Bodegaen",
                        names: []
                    };
                    $.each(data.data, function(ind, elmt) {
                        // This shit is to ensure that the user ends up in the tab that was open when he last closed the page.
                        var active = ind === 0;
                        var ls = localStorage['vaktsys_bar_active'];
                        active = (ls !== undefined && ls === elmt.name);
                        if (active)
                            workplaces.curWorkplace = elmt.name;
                        workplaces.names.push({ name: elmt.name, open: false, active: active});
                    });
                    defer.resolve(workplaces);
                },
                // Error
                function(err) {
                    defer.reject(err);
                }
            );
            return defer.promise;
        };
        this.retrieveShifts = function(date) {
            var defer = $q.defer();
            var date = date || datesliderService.getSimpleStartDate();
            $http.get('/api/shifts/' + date)
            .then(
                // Success
                function(data) {
                    defer.resolve(data);
                },
                // Error
                function(err) {
                    defer.reject(err);
                }
            );
            return defer.promise;
        };
        this.retrieveUserShift = function(id) {
            var defer = $q.defer();

            $http.get('/api/usershift/' + id)
            .then(
                function(data) {
                    defer.resolve(data.data);
                },
                function(err) {
                    defer.reject(err);
                }
            );

            return defer.promise;
        };
        this.retrieveRoles = function() {
            var defer = $q.defer();

            $http.get('/api/roles/')
            .then(
                function(data) {
                    defer.resolve(data.data);
                },
                function(err) {
                    defer.reject(err);
                }
            );

            return defer.promise;
        };

        this.updateUserShift = function(user_id, user_shift_id, role_id, start, finish) {
            var defer = $q.defer();

            $http.post('/api/user_shifts/',
            {
                user_id: user_id,
                user_shift_id: user_shift_id,
                role_id: role_id,
                start: start,
                finish: finish
            })
            .then(
                function(data) {
                    defer.resolve(data);
                },
                function(err) {
                    defer.reject(err);
                }
            );

            return defer.promise;
        }

        // Helper functions
        // Custom sorting for shifts
        var shiftSort = function(keyA, keyB) {
            if (keyA === 'Sent')
                if (keyB === 'Tidlig')       // Sent kommer etter tidlig
                    return 1;
                else                         // .. men før alt annet
                    return -1;
            else if (keyA === 'Tidlig')      // Tidlig er alltid først
                return -1;
            else if (keyA === 'Bacalao')     // Bacalao er alltid sist
                return 1;
            else
                if (keyB === 'Bacalao')
                    return -1;
                else
                    return 1;
        };
        // Function to sort shift in one workplace by description ("Tidlig", "Sent", "Bacalao", custom)
        var sortByDescription = function(data) {
            // Firt we place all shifts in an object per their description
            var items = {};
            $.each(data, function(ind, elmt) {
                if (!(elmt.description in items))
                    items[elmt.description] = [];

                items[elmt.description].push({
                    user_id: elmt.user_id,
                    shift_id: elmt.shift_id,
                    user_shift_id: elmt.user_shift_id,
                    name: elmt.user_name,
                    image: elmt.image,
                    role_id: elmt.role_id,
                    role: elmt.role,
                    start: elmt.start,
                    finish: elmt.finish
                });
            });

            // Then we restructure that shit into an array
            // Slow you say? Fuck that, I've been working on this for 6 hours
            var names = Object.getOwnPropertyNames(items);
            names.sort(shiftSort);

            var ret = [];
            $.each(names, function(ind, name) {
                ret.push({
                    shift: name,
                    people: items[name]
                });
            });

            return ret;
        };
    }]
)

.service('datesliderService', [
    function() {
        this.startDate = moment();
        this.dateDelta = 0;

        this.getDate = function() {
            return moment(this.startDate).add(this.dateDelta, 'days');
        };
        this.getDatePretty = function() {
            return moment(this.startDate).add(this.dateDelta, 'days').norsk('dddd D. MMMM YYYY').capitalize();
        };
        this.getSimpleDate = function() {
            return this.getDate().format('YYYY-MM-DD');
        };
        this.getSimpleStartDate = function() {
            return this.startDate.format('YYYY-MM-DD');
        };
    }]
);