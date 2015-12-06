"use strict";   

// Dynamics and shit (mostly event listeners)
$(document).ready(function() {
    $(document).on('click', 'main #shift-display #left li', function() {
        $('main #view-vaktsys #shift-display #left li').removeClass('selected');
        $(this).addClass('selected');
    });
    // This listener makes sure the max-height property of the shift-list
    // is always equal to the height og the tabs on the left
    $(document).on('DOMSubtreeModified', 'main #shift-display #left ul', function() {
        var hgt = $(this).height();
        $('main #view-vaktsys #shift-display #right').css(
            {
                'max-height': hgt,
                'min-height': hgt,
                'height': hgt
            }
        );
    });
});

// App
app

.controller('vaktsysController', ['$scope', '$http', 'USER_ROLES', 'auth',
    function($scope, $http, USER_ROLES, auth) {

        $scope.loadingShifts = false;
        $scope.bars = {
            curBar: "Bodegaen",
            names: []
        };
        $scope.shifts = {

        };

        // Initialize dateslider
        $scope.dateslider = {
            startDate: moment(),
            dateDelta: 0,
            getDate: function() {
                return moment(this.startDate).add(this.dateDelta, 'days');
            },
            getDatePretty: function() {
                return moment(this.startDate).add(this.dateDelta, 'days').norsk('dddd D. MMMM YYYY').capitalize();
            },
            getSimpleDate: function() {
                return this.getDate().format('YYYY-MM-DD');
            },
            getSimpleStartDate: function() {
                return this.startDate.format('YYYY-MM-DD');
            }
        }

        // Retrieve bars
        $scope.retrieveBars = function() {
            $http({
                method: 'GET',
                url: '/api/bars',
            }).then(
                // Success
                function(res) {
                    $.each(res.data, function(ind, elmt) {
                        $scope.bars.names.push({ name: elmt.name, open: false });
                    })
                    $scope.bars.names[0].selected = true;
                },
                // Error
                function(res) {
                    console.log(res);
                }
            );$scope.shifts
        };
        // Retrieve shifts
        $scope.retrieveShifts = function(date) {
            if (date === undefined)
                var date = $scope.dateslider.getSimpleStartDate();

            // Clear earlier data
            setAllBarsClosed();
            $scope.shifts = {};

            // Set to loading
            $scope.loadingShifts = true;

            $http.get('/api/shifts/' + date)
            .then(
                // Success
                function(res) {
                    for (var key in res.data) {
                        if (res.data.hasOwnProperty(key)) {
                            // Set this bar as open
                            setBarOpen(key);
                            $scope.shifts[key] = sortByDescription(res.data[key]);
                        }
                    }
                    $scope.loadingShifts = false;
                },
                // Error
                function(res) {

                }
            );
        };

        $scope.hasManagingRights = function() {
            return auth.isAuthorized(['admin', 'moderator']);
        }

        // Helper functions
        // Function to set open to true in @scope.bars
        var setAllBarsClosed = function(bar) {
            $.each($scope.bars.names, function(ind, elmt) {
                elmt.open = false;
            });
        };
        var setBarOpen = function(bar) {
            $.each($scope.bars.names, function(ind, elmt) {
                if (elmt.name === bar)
                    elmt.open = true;
            });
        };
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
        // Function to sort shift in one bar by description ("Tidlig", "Sent", "Bacalao", custom)
        var sortByDescription = function(data) {
            // Firt we place all shifts in an object per their description
            var items = {};
            $.each(data, function(ind, elmt) {
                if (!(elmt.description in items))
                    items[elmt.description] = [];

                items[elmt.description].push({
                    user_id: elmt.user_id,
                    name: elmt.name,
                    image: elmt.image,
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

.directive('dateslider',
    function() {
        return {
            retrict: 'E',
            replace: true,
            templateUrl: '/views/vaktsys/dateslider.html',
        };
    }
)
.directive('shiftlist',
    function() {
        return {
            retrict: 'E',
            replace: true,
            templateUrl: '/views/vaktsys/shiftlist.html',
        };
    }
);