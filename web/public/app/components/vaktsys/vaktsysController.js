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
                    console.log(data);
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
                    console.log($scope.shifts);
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
);