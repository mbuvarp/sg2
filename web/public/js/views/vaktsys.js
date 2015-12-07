"use strict";   

// Dynamics and shit (mostly event listeners)
$(document).ready(function() {
    var right = 'main #view-vaktsys #shift-display #right ';
    var left = 'main #view-vaktsys #shift-display #left ';

    // Make active tab look active
    $(document).on('click', left + 'li:not(.blank)', function() {
        $('main #view-vaktsys #shift-display #left li').removeClass('active');
        $(this).addClass('active');
    });
    // Extend li.person on edit
    $(document).on('click', right + '#shift-list li.person td.manage.edit i', function() {
        // Find correct li.person and check if already extended
        var li = $($(this).closest('li.person'));
        if (li.data('extended') === 'true')
            return;

        // Find height of manage-buttons and extend to show them
        var height = $(right + '#shift-list li.person td.manage.cancel').height();
        $(right + '#shift-list li.person td.manage.cancel, td.manage.save').show();
        li.animate({
            height: '+=' + height + 'px'
        }, 200);

        // Set data-extended to true
        li.data('extended', 'true')
    });
    // Cancel/save editing li.person (only visual, backend is taken care of by angular controller)
    $(document).on('click', right + '#shift-list li.person td.manage.cancel, td.manage.save', function() {
        // Find correct li.person and check if already extended
        var li = $($(this).closest('li.person'));
        if (li.data('extended') === 'false')
            return;

        // Find height of manage-buttons and extend to show them
        var height = $(right + '#shift-list li.person td.manage.cancel').height();
        $(right + '#shift-list li.person td.manage.cancel, td.manage.save').show();
        li.animate({
            height: '-=' + height + 'px'
        }, 200);

        // Set data-extended to true
        li.data('extended', 'false')
    });
    // This listener makes sure the max-height property of the shift-list
    // is always equal to the height og the tabs on the left
    // $(document).on('DOMSubtreeModified', left + 'ul', function() {
    //     var hgt = $(this).height();
    //     $(right).css(
    //         {
    //             'max-height': hgt,
    //             'min-height': hgt,
    //             'height': hgt
    //         }
    //     );
    // });
});

// App
app

.controller('vaktsysController', ['$scope', '$http', 'USER_ROLES', 'auth', 'vaktsysService', 'datesliderService',
    function($scope, $http, USER_ROLES, auth, vaktsysService, datesliderService) {

        $scope.loadingShifts = vaktsysService.loadingShifts;
        $scope.bars = vaktsysService.bars;
        $scope.shifts = vaktsysService.shifts;

        // Initialize dateslider
        $scope.dateslider = {
            startDate: datesliderService.startDate,
            dateDelta: datesliderService.dateDelta,
            getDate: datesliderService.getDate,
            getDatePretty: datesliderService.getDatePretty,
            getSimpleDate: datesliderService.getSimpleDate,
            getSimpleStartDate: datesliderService.getSimpleStartDate
        }

        // Retrieve bars
        $scope.retrieveBars = vaktsysService.retrieveBars;
        // Retrieve shifts
        $scope.retrieveShifts = vaktsysService.retrieveShifts;

        $scope.hasManagingRights = function() {
            return auth.isAuthorized(['admin', 'moderator']);
        }

        $scope.init = function() {
            vaktsysService.retrieveBars();
            vaktsysService.retrieveShifts();
        }

        $scope.init();
    }]
)

.service('vaktsysService', ['$http', 'datesliderService',
    function($http, datesliderService) {
        var self = this;

        this.loadingShifts = false;
        this.bars = {
            curBar: "Bodegaen",
            names: []
        };
        this.shifts = {

        };

        this.retrieveBars = function() {
            $http.get('/api/bars').then(
                // Success
                function(res) {
                    $.each(res.data, function(ind, elmt) {
                        self.bars.names.push({ name: elmt.name, open: false, active: ind === 0});
                    });
                },
                // Error
                function(res) {
                    console.log(res);
                }
            );
        };
        this.retrieveShifts = function(date) {
            var date = date || datesliderService.getSimpleStartDate();

            // Clear previous data (do NOT clear self.shifts by using { } as this will remove the binding to the controller)
            setAllBarsClosed();
            for (var e in self.shifts) if (self.shifts.hasOwnProperty(e)) delete self.shifts[e];

            // Set to loading
            self.loadingShifts = true;

            $http.get('/api/shifts/' + date)
            .then(
                // Success
                function(res) {
                    for (var key in res.data) {
                        if (res.data.hasOwnProperty(key)) {
                            // Set this bar as open
                            setBarOpen(key);
                            self.shifts[key] = sortByDescription(res.data[key]);
                        }
                    }
                    self.loadingShifts = false;
                },
                // Error
                function(res) {
                    console.log(res);
                }
            );
        };

        // Helper functions
        // Function to set open to true in this.bars
        var setAllBarsClosed = function(bar) {
            $.each(self.bars.names, function(ind, elmt) {
                elmt.open = false;
            });
        };
        var setBarOpen = function(bar) {
            $.each(self.bars.names, function(ind, elmt) {
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