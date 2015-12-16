"use strict";

angular

.module('app')

.controller('LoginController', ['$scope', '$rootScope', 'AUTH_EVENTS', 'authService', '$stateParams', LoginController]);

function LoginController($scope, $rootScope, AUTH_EVENTS, authService, $stateParams) {
    $scope.msg401 = $stateParams['401'] === '1';
    $scope.msg419 = $stateParams['419'] === '1';
    $scope.credentials = {
        username: '',
        password: ''
    };
    $scope.login = function (credentials) {
        authService.login(credentials)
        .then(function (user) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        }, function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    };
}