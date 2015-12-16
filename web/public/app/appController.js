"use strict";

angular

.module('app')

.controller('AppController', ['$rootScope', '$scope', 'USER_ROLES', 'authService', '$state', AppController])

function AppController($rootScope, $scope, USER_ROLES, authService, $state) {
    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthenticated = authService.isAuthenticated;
    $scope.isLoginPage = false;

    $scope.logout = function() {
        authService.logout()
        .then(function() {
            $state.go('login');
        });
    };
    $scope.setCurrentUser = function(user) {
        $scope.currentUser = user;
    };
    $scope.setLoginPage = function(is) {
        $scope.isLoginPage = is;
    };

    // Global events
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $scope.setLoginPage(toState.name === '/login');
    });
    $rootScope.$on('auth-login-success', function (event) {
        $state.go('front');
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