(function() {

    "use strict";

    angular.module('sg2')

    .config(['$locationProvider', '$httpProvider', '$logProvider',
        function($locationProvider, $httpProvider, $logProvider) {
            $logProvider.debugEnabled(true);

            $locationProvider.html5Mode(true);

            $httpProvider.interceptors.push('authInterceptor');
        }]
    )

    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES',
        function($stateProvider, $urlRouterProvider, USER_ROLES) {
            
            $urlRouterProvider.otherwise('/404');

            $stateProvider

            .state('home', {
                url: '/',
                templateUrl: '/app/components/home/home.html',
                controller: 'HomeController',
                data: {
                    title: '',
                    authorizedRoles: [USER_ROLES.all]
                }
            })

            .state('login', {
                url: '/login',
                templateUrl: '/app/components/login/login.html',
                controller: 'LoginController',
                params: {
                    '401': '0',
                    '419': '0'
                },
                data: {
                    title: 'Logg inn',
                    authorizedRoles: [USER_ROLES.all]
                }
            })

            .state('logout', {
                url: '/logout',
                data: {
                    title: 'Logg ut',
                    authorizedRoles: [USER_ROLES.all]
                },
                controller: ['$state', 'authService',
                    function($state, authService) {
                        authService.logout();
                        $state.go('home');
                    }
                ]
            })

            .state('minbruker', {
                url: '/minbruker',
                templateUrl: '/app/components/minbruker/minbruker.html',
                controller: 'MinbrukerController',
                data: {
                    title: 'Min bruker',
                    authorizedRoles: [USER_ROLES.all]
                }
            })

            .state('vaktsys', {
                url: '/vaktsys',
                templateUrl: '/app/components/vaktsys/vaktsys.html',
                data: {
                    title: 'Vaktsys',
                    authorizedRoles: [USER_ROLES.user, USER_ROLES.moderator, USER_ROLES.admin]
                }
            })

            .state('otherwise', {
                url: '/404',
                templateUrl: '/app/components/errors/404/404.html',
                data: {
                    title: 'Siden finnes ikke',
                    authorizedRoles: [USER_ROLES.all]
                }
            });
        }]
    )

    .directive('ngElementReady', [
        function() {
            return {
                priority: Number.MIN_SAFE_INTEGER, // Execute last, after all other directives if any.
                restrict: "A",
                link: function($scope, $element, $attributes) {
                    $scope.$eval($attributes.ngElementReady); // Execute the expression in the attribute.
                }
            };
        }]
    );

}());