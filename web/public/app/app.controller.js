(function() {

    "use strict";

    angular.module('sg2')

    .controller('AppController', ['$log', '$rootScope', '$scope', 'USER_ROLES', 'authService', '$state', 'msgBoxService', AppController])

    function AppController($log, $rootScope, $scope, USER_ROLES, authService, $state, msgBoxService) {
        $rootScope.currentUser = null;
        $rootScope.userRoles = USER_ROLES;
        $rootScope.isAuthenticated = authService.isAuthenticated;
        $rootScope.isLoginPage = false;

        $rootScope.logout = logout;
        $rootScope.setCurrentUser = setCurrentUser;
        $rootScope.setLoginPage = setLoginPage;

        function logout() {
            authService.logout()
            .then(function() {
                $state.go('login');
            });
        }
        function setCurrentUser(user) {
            $rootScope.currentUser = user;
        }
        function setLoginPage(is) {
            $rootScope.isLoginPage = is;
        }

        // Global events
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            setLoginPage(toState.name === '/login');
        });
        $rootScope.$on('auth-login-success', function (event) {
            $state.go('home');
        });
        $rootScope.$on('auth-login-failed', function (event) {
            alert("LOGIN FAILED"); // TODO
        });
        $rootScope.$on('auth-not-authenticated', function (event) {
            console.log("NOT AUTHENTICATED"); // TODO
            $state.go('login', { '401': '1', '403': '0' });

        });
        $rootScope.$on('auth-not-authorized', function (event) {
            alert("NOT AUTHORIZED"); // TODO
        });
    }

}());