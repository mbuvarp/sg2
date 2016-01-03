(function() {

    "use strict";

    angular.module('sg2')

    .directive('userlist',
        function() {
            return {
                restrict: 'E',
                replace: false,
                templateUrl: '/app/shared/userlist/userlist.html',
                scope: {
                    value: '=',
                    uname: '=',
                    affiliation: '@',
                    minimized: '@'
                },
            };  
        }
    )

    .controller('UserListController', ['$log', '$scope', 'userListService', UserListController])

    .factory('userListService', ['$log', '$http', userListService]);

    function UserListController($log, $scope, userListService) {
        var vm = this;

        // Exports
        // ====================
        vm.uname = '';
        vm.affiliations = [];
        vm.users = [];
        vm.isMinimized = true;
        vm.selectedAffiliation = 1;
        vm.maxHeight = 0;
        vm.toggleMinimized = toggleMinimized;
        vm.calcMaxHeight = calcMaxHeight;

        // Private variables
        // ====================
        var firstOpen = true;

        // Public
        // ====================
        function toggleMinimized(set) {
            if (firstOpen && vm.isMinimized) {
                buildFirstTime();
                firstOpen = false;
            }
            vm.isMinimized = set === undefined ? !vm.isMinimized : set;
        }
        function calcMaxHeight() {
            vm.maxHeight = $('userlist .wrapper .large ul.affiliations').height();
        }

        // Private
        // ====================
        function retrieveAffiliations() {
            userListService.retrieveAffiliations()
            .then(
                function(data) {
                    vm.affiliations = data.data;
                },
                function(err) {
                    $log.error(err);
                }
            );
        }
        function retrieveUsers() {
            userListService.retrieveUsers()
            .then(
                function(data) {
                    vm.users = sortUsersByAffiliation(data.data);
                    var user = getUserById($scope.value);
                    vm.selectedUserName = user !== undefined ? (user.name || '[ERROR]') : '[ERROR]';
                },
                function(err) {
                    $log.error(err);
                }
            );
        }
        function buildFirstTime() {
            retrieveAffiliations();
            retrieveUsers();
        }

        // Helpers
        //=====================
        function sortUsersByAffiliation(users) {
            var ret = { };
            for (var u = 0; u < users.length; ++u) {
                var user = users[u];

                if (ret[user.affiliation_id] === undefined)
                    ret[user.affiliation_id] = [];

                ret[user.affiliation_id].push({
                    uid: user.user_id,
                    name: user.name,
                    image: user.image
                });
            }
            return ret;
        }
        function getUserById(id) {
            for (var a in vm.users) {
                if (vm.users.hasOwnProperty(a)) {
                    var find = vm.users[a].find(function(elmt, ind, arr) {
                        return elmt.uid == id;
                    });
                    if (find !== undefined)
                        return find;
                }
            }
            return undefined;
        }

        // Init
        // ====================
        function init() {
            vm.uname = $scope.uname || '';
            vm.isMinimized = ($scope.minimized !== undefined ? $scope.minimized === 'true' : true);
        }
        init();
    }

    function userListService($log, $http) {
        function retrieveAffiliations() {
            return $http.get('/api/affiliations');
        }
        function retrieveUsers() {
            return $http.get('/api/useraffiliations');
        }

        return {
            retrieveAffiliations: retrieveAffiliations,
            retrieveUsers: retrieveUsers
        };
    }

}());