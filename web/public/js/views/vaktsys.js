"use strict";   

// Dynamics and shit (mostly event listeners)
$(document).ready(function() {
    var right = 'main #view-vaktsys #shift-display #right ';
    var left = 'main #view-vaktsys #shift-display #left ';

    // Make active tab look active and save active bar in localStorage
    $(document).on('click', left + 'li:not(.blank)', function() {
        $('main #view-vaktsys #shift-display #left li').removeClass('active');
        $(this).addClass('active');

        var bar = $(this).attr('id').split('-')[1];
        localStorage['vaktsys_bar_active'] = bar;
    });
    // Extend li.person on edit
    $(document).on('click', right + '#shift-list li.person div.manage div.edit i', function() {
        // Find correct li.person and check if already extended
        var li = $($(this).closest('li.person'));
        if (li.data('extended') === 'true')
            return;

        // Find height of manage-buttons and extend to show them
        var height = $(right + '#shift-list li.person div.bottom').height();
        li.animate({
            height: '+=' + height + 'px'
        }, 200);

        // Set data-extended to true
        li.data('extended', 'true');
        // Hide this button
        $(this).fadeOut(100);
    });
    // Cancel/save editing li.person (only visual, backend is taken care of by angular controller)
    $(document).on('click', right + '#shift-list li.person div.bottom div.cancel, div.confirm', function() {
        // Find correct li.person and check if already extended
        var li = $($(this).closest('li.person'));
        if (li.data('extended') === 'false')
            return;

        // Find height of manage-buttons and extend to show them
        var height = $(right + '#shift-list li.person div.bottom').height();
        li.animate({
            height: '-=' + height + 'px'
        }, 200);

        // Set data-extended to true
        li.data('extended', 'false')
        // Show edit/remove-buttons
        $(right + '#shift-list li.person div.manage div.edit i').fadeIn(100);
        $(right + '#shift-list li.person div.manage div.remove i').fadeIn(100)
    });
});

// App
app

.controller('vaktsysController', ['$scope', '$http', 'USER_ROLES', 'auth', 'vaktsysService', 'datesliderService',
    function($scope, $http, USER_ROLES, auth, vaktsysService, datesliderService) {

        $scope.loadingShifts = false;
        $scope.workplaces = {
            curWorkplace: "Bodegaen",
            names: []
        };
        $scope.roles = [];
        $scope.shifts = {

        };

        // Management variables
        $scope.managed = {

        };

        // Initialize dateslider
        $scope.dateslider = {
            startDate: datesliderService.startDate,
            dateDelta: datesliderService.dateDelta,
            getDate: datesliderService.getDate,
            getDatePretty: datesliderService.getDatePretty,
            getSimpleDate: datesliderService.getSimpleDate,
            getSimpleStartDate: datesliderService.getSimpleStartDate
        };

        $scope.setCurrentlyManaging = function (wp, id, bool) {
            $scope.managed[wp][id].currentlyManaging = bool;
        };
        $scope.resetManagingChanges = function(wp, id) {
            // TODO Should reset managed
            $scope.setCurrentlyManaging(wp, id, false);
        };
        $scope.updateShiftsFromManaged = function(wp, id) {
            console.log($scope.shifts);
            console.log($scope.managed);
        };
        $scope.saveManagingChanges = function(wp, id) {
            // If not actually managing (someone has been hacking!!), then return
            if (!$scope.managed[wp][id].currentlyManaging)
                return;

            var dis = $scope.managed[wp][id];
            return vaktsysService.updateUserShift(
                                                      dis.user_id,
                                                      dis.user_shift_id,
                                                      Number(dis.role_id),
                                                      dis.start,
                                                      dis.finish
                                                  )
            .then(
                function(data) {
                    $scope.updateShiftsFromManaged(wp, id);
                    $scope.resetManagingChanges(wp, id);

                },
                function(err) {
                    $scope.resetManagingChanges(wp, id);
                }
            );
        };

        // Retrieve workplaces
        $scope.retrieveWorkplaces = function() {
            return vaktsysService.retrieveWorkplaces()
            .then(
                function(data) {
                    $scope.workplaces = data;
                },
                function(err) {
                    console.log(err);
                }
            );
        };
        // Retrieve roles
        $scope.retrieveRoles = function() {
            return vaktsysService.retrieveRoles()
            .then(
                function(data) {
                    $scope.roles = data;
                },
                function(err) {
                    console.log(err);
                }
            );
        };
        // Retrieve shifts
        $scope.retrieveShifts = function(date) {
            // Reset shit and set to loading
            $scope.loadingShifts = true;
            setAllWorkplacesClosed();
            $scope.shifts = { };

            return vaktsysService.retrieveShifts(date)
            .then(
                function(data) {
                    $scope.shifts = data;
                    setWorkplacesOpen();
                    $scope.loadingShifts = false;
                },
                function(err) {
                    console.log(err);
                }
            )
            .then(
                function() {
                    initManaged($scope.shifts);
                }
            );
        };

        $scope.hasManagingRights = function() {
            return auth.isAuthorized(['admin', 'moderator']);
        }

        // Helper functions
        // Function to set open to true in this.workplaces
        var setAllWorkplacesClosed = function() {
            $.each($scope.workplaces.names, function(ind, elmt) {
                elmt.open = false;
            });
        };
        var setWorkplacesOpen = function() {
            for (var w in $scope.shifts)
                if ($scope.shifts.hasOwnProperty(w))
                    $.each($scope.workplaces.names, function(ind, elmt) {
                        if (elmt.name === w)
                            elmt.open = true;
                    });
        };
        var initManaged = function(shifts) {
            for (var w in shifts) {
                if (shifts.hasOwnProperty(w)) {
                    $scope.managed[w] = { };
                    $.each(shifts[w], function(ind, elmt) {
                        $.each(elmt.people, function(ind2, elmt2) {
                            var dis = $scope.managed[w][elmt2.user_id] = { };
                            dis['currentlyManaging'] = false;
                            dis['user_id'] = elmt2.user_id;
                            dis['shift_id'] = elmt2.shift_id;
                            dis['user_shift_id'] = elmt2.user_shift_id;
                            dis['name'] = elmt2.name;
                            dis['role_id'] = elmt2.role_id;
                            dis['start'] = elmt2.start;
                            dis['finish'] = elmt2.finish;
                        });
                    });
                }
            }
        };

        $scope.init = function() {
            $scope.retrieveWorkplaces();
            $scope.retrieveRoles();
            $scope.retrieveShifts();
        }
        $scope.init();
    }]
)

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
                    var shifts = { };
                    for (var key in data.data)
                        if (data.data.hasOwnProperty(key))
                            shifts[key] = sortByDescription(data.data[key]);
                    defer.resolve(shifts);
                },
                // Error
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
        }

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
)

.directive('dateslider',
    function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/views/vaktsys/dateslider.html',
        };
    }
)
.directive('shiftlist',
    function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/views/vaktsys/shiftlist.html',
        };
    }
)
.directive('personcard',
    function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/views/vaktsys/personcard.html',
        };
    }
)

.directive('timeInput', function() {
    return {
        require: 'ngModel',
        link:
        function(scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(
                function(data) {
                    // Convert data from view format to model format
                    var ret = moment(ngModelController.$modelValue).format('YYYY-MM-DD');
                    ret += ' ' + data;
                    return moment(ret).isValid() ? moment(ret).toISOString() : ngModelController.$modelValue;
                }
            );

            ngModelController.$formatters.push(
                function(data) {
                    // Convert data from model format to view format
                    data = moment(data).format('HH:mm');
                    return data; //converted
                }
            );
        }
    }
});