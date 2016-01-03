(function() {

    "use strict";

    angular.module('sg2')

    .controller('LoginController', ['$log', '$scope', '$rootScope', 'AUTH_EVENTS', 'authService', '$stateParams', LoginController]);

    function LoginController($log, $scope, $rootScope, AUTH_EVENTS, authService, $stateParams) {
        var vm = this;

        vm.msg401 = $stateParams['401'] === '1';
        vm.msg419 = $stateParams['419'] === '1';
        vm.credentials = {
            username: '',
            password: ''
        };
        vm.remember = true;
        vm.login = login;

        function login(credentials) {
            authService.login(vm.credentials)
            .then(function (user) {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        }
    }

}());