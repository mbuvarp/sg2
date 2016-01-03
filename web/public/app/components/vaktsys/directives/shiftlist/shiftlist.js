(function() {

    "use strict";

    angular.module('sg2')

    .directive('shiftlist',
        function() {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/app/components/vaktsys/directives/shiftlist/shiftlist.html'
            };
        }
    )

    .controller('vaktsys.ShiftListController', ['$log', '$scope', 'vaktsys.shiftListService', 'vaktsys.sharedService', ShiftListController])

    .factory('vaktsys.shiftListService', ['$http', 'dateSliderService', shiftListService])

    .filter('byKey',
        function() {
            return function(obj, sel) {
                if (sel === 'Sent' || sel === 'Tidlig') {
                    console.log(obj)
                    console.log(obj[sel]);
                }
                return obj[sel];
            };
        }
    );

    function ShiftListController($log, $scope, shiftListService, sharedService) {
        var vm = this;

        // Exports
        vm.loadingShifts = true;
        vm.shifts = { };
        vm.curWorkplace = 'Bodegaen';
        vm.date = '';
        vm.nrOfShifts = nrOfShifts;
        vm.hasManagingRights = hasManagingRights;

        // Public
        function nrOfShifts(wp) {
            var wp = wp || vm.curWorkplace;
            var sh = vm.shifts[wp];
            if (sh === undefined)
                return;

            return Object.keys(sh).length;
        }
        function hasManagingRights() {
            return sharedService.hasManagingRights();
        }

        // Helpers
        function setAllWorkplacesClosed() {
            sharedService.setAllWorkplacesClosed();
        }
        function correctShiftStructure(shifts) {
            function fixShiftData(shift) {
                shift.name = shift.user_name;                                       delete shift.user_name;
                shift.image = shift.user_image;                                     delete shift.user_image;
                shift.workplace = shift.workplace_name;                             delete shift.workplace_name;
                shift.start = shift.user_shift_start || shift.shift_start;          delete shift.user_shift_start; delete shift.shift_start;
                shift.finish = shift.user_shift_finish || shift.shift_finish;       delete shift.user_shift_finish; delete shift.shift_finish;
                shift.role = shift.role_name;                                       delete shift.role_name;
                shift.role_id = shift.user_shift_role_id;                           delete shift.user_shift_role_id;
                shift.type = shift.shift_type_name;                                 delete shift.shift_type_name;
                shift.type_id = shift.shift_type_id;                                delete shift.shift_type_id;
                shift.description = shift.shift_description;                        delete shift.shift_description;
                return shift;
            }
            function getAllWorkplaces(arr) {
               var ret = [];
               for (var i = 0; i < arr.length; ++i) {
                   if (ret.indexOf(arr[i].workplace_name) === -1)
                       ret.push(arr[i].workplace_name);
               }
               return ret;
            }
            function getAllShiftTypes(arr) {
               var ret = [];
               for (var i = 0; i < arr.length; ++i) {
                   if (ret.indexOf(arr[i].shift_type_name) === -1)
                       ret.push(arr[i].shift_type_name);
               }
               return ret;
            }
            function getAllUserIds(arr) {
               var ret = [];
               for (var i = 0; i < arr.length; ++i) {
                   if (ret.indexOf(arr[i].user_id) === -1)
                       ret.push(arr[i].user_id);
               }
               return ret;
            }

            var ret = { };
            var allWorkplaces = getAllWorkplaces(shifts);
            for (var w = 0; w < allWorkplaces.length; ++w) {
                var workplace = allWorkplaces[w];
                if (ret[workplace] === undefined)
                    ret[workplace] = { };

                var allTypes = getAllShiftTypes(shifts.filter(
                    function(input) {
                        return input.workplace_name === workplace;
                    }
                ));
                for (var t = 0; t < allTypes.length; ++t) {
                    var type = allTypes[t];
                    if (ret[workplace][type] === undefined)
                        ret[workplace][type] = { };

                    var allUserIds = getAllUserIds(shifts.filter(
                        function(input) {
                            return input.workplace_name === workplace && input.shift_type_name === type;
                        }
                    ));
                    for (var i = 0; i < allUserIds.length; ++i) {
                        var id = allUserIds[i];
                        ret[workplace][type][id] = { };

                        ret[workplace][type][id] = fixShiftData(shifts.filter(
                            function(input) {
                                return input.workplace_name === workplace && input.shift_type_name === type && input.user_id === id;
                            }
                        )[0]);
                    }
                }
            }

           return ret;
        }

        // Events
        $scope.$on('vaktsys.update', handleUpdate);
        function handleUpdate(event, args) {
            if (args.what === 'workplaces')
                vm.curWorkplace = args.newVal.curWorkplace;

            // Only update if variable already exists. All relevant variables for this controller should be already declared.
            if (vm[args.what] !== undefined)
                vm[args.what] = args.newVal;

            if (args.what === 'date')
                retrieveShifts(vm.date);
        }

        // Functions
        function retrieveShifts(date) {
            // Reset shit and set to loading
            vm.loadingShifts = true;
            setAllWorkplacesClosed();
            sharedService.updateShifts({ });

            return shiftListService.retrieveShifts(date)
            .then(
                function(data) {
                    var sh = correctShiftStructure(data.data);
                    sharedService.updateShifts(sh);
                    sharedService.setWorkplacesOpen();
                    vm.loadingShifts = false;
                },
                function(err) {
                    console.log(err);
                }
            )
            .then(
                function() {
                    // initShiftsByWorkplace();
                    // initShiftsByUserShiftId();
                    // initManaging();
                }
            );
        }


        // Init
        function init() {
            retrieveShifts();
        }
        init();
    }

    function shiftListService($http, dateSliderService) {

        function retrieveShifts(date) {
            var date = date || dateSliderService.getSimpleStartDate();
            return $http.get('/api/shifts/' + date);
        }

        return {
            retrieveShifts: retrieveShifts,
        };
    }

}());