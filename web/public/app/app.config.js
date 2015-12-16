"use strict";

angular

.module('app')

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
            templateUrl: '/app/components/logout/logout.html',
            controller: 'LogoutController',
            data: {
                title: 'Logg ut',
                authorizedRoles: [USER_ROLES.all]
            }
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
            controller: 'VaktsysController',
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
);