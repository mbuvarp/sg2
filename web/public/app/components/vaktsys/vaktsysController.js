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

        // FEILEN LIGGER I JQUERY OFFCOURSE

        // Set data-extended to true
        li.data('extended', 'false')
        // Show edit/remove-buttons
        $(right + '#shift-list li.person div.manage div.edit i').fadeIn(100);
        $(right + '#shift-list li.person div.manage div.remove i').fadeIn(100)
    });
});

// App
angular

.module('app')

.controller('VaktsysController', ['$scope', '$http', 'USER_ROLES', 'authService', 'vaktsysService', 'datesliderService', VaktsysController]);

function VaktsysController($scope, $http, USER_ROLES, authService, vaktsysService, datesliderService) {

    $scope.loadingShifts = false;
    $scope.workplaces = {
        curWorkplace: "Bodegaen",
        names: []
    };
    $scope.roles = [];
    $scope.shifts = [];
    $scope.shiftsByWorkplace = { };
    $scope.shiftsByUserShiftId = { };
    $scope.managing = { };

    // Initialize dateslider
    $scope.dateslider = {
        startDate: datesliderService.startDate,
        dateDelta: datesliderService.dateDelta,
        getDate: datesliderService.getDate,
        getDatePretty: datesliderService.getDatePretty,
        getSimpleDate: datesliderService.getSimpleDate,
        getSimpleStartDate: datesliderService.getSimpleStartDate
    };

    $scope.setCurrentlyManaging = function (id, bool) {
        $scope.managing[id].managing = bool;
        
        var us = $scope.shiftsByUserShiftId[id];
        $scope.managing[id]['user_id'] = us.user_id;
        $scope.managing[id]['user_name'] = us.user_name;
        $scope.managing[id]['user_shift_id'] = us.user_shift_id;
        $scope.managing[id]['role_id'] = us.role_id;
        $scope.managing[id]['start'] = us.start;
        $scope.managing[id]['finish'] = us.finish;
    };
    $scope.resetManagingChanges = function(id) {
        // TODO Should reset managing
        $scope.setCurrentlyManaging(id, false);
    };
    $scope.updateShiftsFromManaged = function(id) {
        var shift = $scope.shifts.find(function(elmt, index, array) { return elmt.user_shift_id === id; });
        vaktsysService.retrieveUserShift(id)
        .then(
            function(data) {
                // TODO: LOADING GIF THINGY
                fixStartAndFinish(data[0])
                var newShift = data[0];
                for (var key in shift) {
                    if (shift.hasOwnProperty(key) && newShift.hasOwnProperty(key)) {
                        shift[key] = newShift[key];
                    }
                }
                initShiftsByWorkplace();
            },
            function(err) {
                console.log(err);
            }
        );
    };
    $scope.saveManagingChanges = function(id) {
        // If not actually managing (someone has been hacking!!), then return
        // TODO: cannot just return
        if (!$scope.managing[id])
            return;

        var man = $scope.managing[id];
        return vaktsysService.updateUserShift(
                                                  man.user_id,
                                                  man.user_shift_id,
                                                  Number(man.role_id),
                                                  man.start,
                                                  man.finish
                                              )
        .then(
            function(data) {
                $scope.updateShiftsFromManaged(id);
                $scope.resetManagingChanges(id);
            },
            function(err) {
                $scope.resetManagingChanges(id);
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
        $scope.shifts = [];

        return vaktsysService.retrieveShifts(date)
        .then(
            function(data) {
                $.each(data.data, function(ind, elmt) {
                    fixStartAndFinish(elmt);
                });
                $scope.shifts = data.data;
                setWorkplacesOpen();
                $scope.loadingShifts = false;
            },
            function(err) {
                console.log(err);
            }
        )
        .then(
            function() {
                initShiftsByWorkplace();
                initShiftsByUserShiftId();
                initManaging();
            }
        );
    };

    $scope.hasManagingRights = function() {
        return authService.isAuthorized(['admin', 'moderator']);
    }

    // Helper functions
    // Function to set open to true in this.workplaces
    var setAllWorkplacesClosed = function() {
        $.each($scope.workplaces.names, function(ind, elmt) {
            elmt.open = false;
        });
    };
    var setWorkplacesOpen = function() {
        // Go through each element in the shifts-array and look for workplace-names, and mark them as open
        $.each($scope.shifts, function(ind, elmt) {
            $scope.workplaces.names.find(function(element, index, array) { return element.name === elmt.workplace_name; }).open = true;
        });
    };

    var initShiftsByWorkplace = function() {
        var data = $scope.shifts;

        var o = {};
        for (var r = 0; r < data.length; ++r) {
            var curRes = data[r];

            if (o[curRes.workplace_name] == undefined)
                o[curRes.workplace_name] = [];

            o[curRes.workplace_name].push({
                user_id: Number(curRes.user_id),
                shift_id: Number(curRes.shift_id),
                user_shift_id: Number(curRes.user_shift_id),
                user_name: curRes.user_name,
                image: curRes.image,
                role_id: curRes.role_id,
                role: curRes.role_name,
                start: curRes.user_shift_start || curRes.shift_start,
                finish: curRes.user_shift_finish || curRes.shift_finish,
                description: curRes.description
            });
        }

        var ret = { };
        for (var key in o)
            if (o.hasOwnProperty(key))
                ret[key] = sortByDescription(o[key]);

        $scope.shiftsByWorkplace = ret;
    };
    var initShiftsByUserShiftId = function() {
        $.each($scope.shifts, function(ind, elmt) {
            $scope.shiftsByUserShiftId[elmt.user_shift_id] = elmt;
        });
    };
    var initManaging = function() {
        for (var s in $scope.shiftsByUserShiftId) {
            if ($scope.shiftsByUserShiftId.hasOwnProperty(s)) {
                var us = $scope.shiftsByUserShiftId[s];
                $scope.managing[s] = { };
                $scope.managing[s]['managing'] = false;
                $scope.managing[s]['user_id'] = us.user_id;
                $scope.managing[s]['user_name'] = us.user_name;
                $scope.managing[s]['user_shift_id'] = us.user_shift_id;
                $scope.managing[s]['role_id'] = us.role_id;
                $scope.managing[s]['start'] = us.start;
                $scope.managing[s]['finish'] = us.finish;
            }
        }
    };
    var fixStartAndFinish = function(shift) {
        shift.start = shift.user_shift_start || shift.shift_start;
        shift.finish = shift.user_shift_finish || shift.shift_finish;
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
    // Function to sort shift in one workplace by description ("Tidlig", "Sent", "Bacalao", custom)
    var sortByDescription = function(data) {
        // First we place all shifts in an object per their description
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

    $scope.init = function() {
        $scope.retrieveWorkplaces();
        $scope.retrieveRoles();
        $scope.retrieveShifts();
    }
    $scope.init();
}