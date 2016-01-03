(function() {

    "use strict";

    angular.module('sg2')

    .directive('personcard',
        function() {
            return {
                restrict: 'E',
                replace: false,
                scope: {
                    uid: '@',
                    name: '@',
                    image: '@',
                    role: '@',
                    roleid: '@',
                    start: '@',
                    finish: '@',
                    usershiftid: '@'
                },
                templateUrl: '/app/components/vaktsys/directives/personcard/personcard.html'
            };
        }
    )

    .controller('vaktsys.PersonCardController', ['$log', '$scope', 'vaktsys.personCardService',  'msgBoxService', 'vaktsys.sharedService', PersonCardController])

    .factory('vaktsys.personCardService', ['$log', '$http', 'vaktsys.sharedService', personCardService]);

    function PersonCardController($log, $scope, personCardService, msgBoxService, sharedService) {
        var vm = this;

        // Export
        vm.isManaging = false;
        vm.hasManagingRights = hasManagingRights;
        vm.roles = [];
        vm.managing = { };
        vm.setCurrentlyManaging = setCurrentlyManaging;
        vm.resetManagingChanges = resetManagingChanges;
        vm.saveManagingChanges = saveManagingChanges;

        // Public
        function hasManagingRights() {
            return sharedService.hasManagingRights();
        }
        function setCurrentlyManaging(bool) {
            vm.isManaging = bool;
            
            vm.managing['uid'] = $scope.uid;
            vm.managing['name'] = $scope.name;
            vm.managing['image'] = $scope.image;
            vm.managing['role'] = $scope.role;
            vm.managing['roleid'] = $scope.roleid;
            vm.managing['start'] = $scope.start;
            vm.managing['finish'] = $scope.finish;
            vm.managing['usershiftid'] = $scope.usershiftid;
        }
        function resetManagingChanges() {
            // TODO Should reset managing
            vm.setCurrentlyManaging(false);
        }
        function updateShiftsFromManaged() {
            personCardService.retrieveUserShift($scope.usershiftid)
            .then(
                function(data) {
                    // TODO: LOADING GIF THINGY
                    var us = data[0];
                    $scope.uid = us.uid;
                    $scope.name = us.name;
                    $scope.image = us.image;
                    $scope.role = us.role;
                    $scope.roleid = us.roleid;
                    $scope.start = us.start;
                    $scope.finish = us.finish;
                    $scope.usershiftid = us.usershiftid;
                },
                function(err) {
                    console.log(err);
                }
            );
        };
        function saveManagingChanges() {
            // If not actually managing (someone has been hacking!!), then return
            // TODO: cannot just return
            if (!vm.isManaging)
                return;

            var man = vm.managing;
            return personCardService.updateUserShift(
                                                      man.uid,
                                                      man.usershiftid,
                                                      Number(man.roleid),
                                                      man.start,
                                                      man.finish
                                                  )
            .then(
                function(data) {
                    updateShiftsFromManaged();
                    vm.resetManagingChanges();
                },
                function(err) {
                    $scope.resetManagingChanges(id);
                }
            );
        };

        // Private
        function retrieveRoles() {
            return personCardService.retrieveRoles()
            .then(
                function(data) {
                    vm.roles = data;
                },
                function(err) {
                    console.log(err);
                }
            );
        }
        function initManaging() {
            setCurrentlyManaging(false);
        }

        function init() {
            retrieveRoles();
            initManaging();
        }
        init();
    }

    function personCardService($log, $http, sharedService) {

        function retrieveRoles() {
            return $http.get('/api/roles/')
            .then(
                function(data) {
                    return data.data;
                },
                function(err) {
                    return err;
                }
            );
        }
        function retrieveUserShift(id) {
            return $http.get('/api/usershift/' + id)
            .then(
                function(data) {
                    return data.data;
                },
                function(err) {
                    return err
                }
            );
        }
        function updateUserShift(user_id, user_shift_id, role_id, start, finish) {
            return $http.post('/api/user_shifts/',
            {
                user_id: user_id,
                user_shift_id: user_shift_id,
                role_id: role_id,
                start: start,
                finish: finish
            })
            .then(
                function(data) {
                    return data;
                },
                function(err) {
                    return err;
                }
            );
        }

        return {
            retrieveRoles: retrieveRoles,
            retrieveUserShift: retrieveUserShift,
            updateUserShift: updateUserShift
        };
    }

}());