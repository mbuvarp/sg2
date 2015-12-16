"use strict";

angular

.module('app')

.constant('AUTH_EVENTS',
    {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    }
)
.constant('USER_ROLES',
    {
        all: '*',
        admin: 'admin',
        moderator: 'moderator',
        user: 'user',
        guest: 'guest'
    }
)

.service('session', ['$q',
        function($q) {
            this.getToken = function() {
                return sessionStorage['jwtToken']; 
            }
            this.saveToken = function(token) {
                sessionStorage['jwtToken'] = token;
            }
            this.parseJwt = function(token) {
                var split = token.split('.')[1];
                var b64 = split.replace('-', '+').replace('_', '/');
                return JSON.parse(atob(b64));
            }
            this.getField = function(field) {
                if (!this.getToken())
                    return null;

                var obj = this.parseJwt(this.getToken());
                return obj[field];
            }
            this.destroy = function() {
                return $q.when(sessionStorage.removeItem('jwtToken'));
            }
        }
    ]
)
.factory('authService', ['$http', 'session', 'USER_ROLES',
    function($http, session, USER_ROLES) {
        var authService = {};

        // Check if client is authorized
        authService.tokenExpired = function() {
            return new Date(session.getField('exp')) <= Math.round(new Date().getTime() / 1000);
        }
        authService.isAuthenticated = function() {
            return !!session.getToken() && !authService.tokenExpired();
        }
        authService.isAuthorized = function(roles) {
            if ((!roles instanceof Array))
                roles = [roles];

            if (roles.indexOf(USER_ROLES.all) != -1)
                return true;

            var role = session.getField('role');
            return authService.isAuthenticated() && role && roles.indexOf(role) != -1;
        }
        authService.login = function(credentials) {
            return $http.post('/api/login', credentials)
                    .then(function(res) {   
                        if (res.data.jwtToken)
                            session.saveToken(res.data.jwtToken);
                        return !!res.data.token;
                    }, function(err) {
                        // TODO Login failed
                    });
        }
        authService.logout = function() {
            return session.destroy();
        }

        return authService;
    }]
)
.factory('authInterceptor', ['session', '$rootScope', 'AUTH_EVENTS', '$q', '$log',
    function(session, $rootScope, AUTH_EVENTS, $q, $log) {
        return {
            request: function(req) {
                // Is there a token here? In that case, provide it!
                var jwtToken = session.getToken();
                if (jwtToken)
                    req.headers.Authorization = 'Bearer ' + jwtToken;

                $log.debug('Sending %s-request to %s', req.method, req.url, req);

                return $q.resolve(req);
            },
            response: function(res) {
                // Got a new jwtToken for me?
                var header = res.headers('Authorization');
                if (header && header.indexOf('Bearer ') != -1)
                    session.saveToken(header.split(' ')[1]);

                $log.debug('Recieved response from %s, status %s %s', res.config.url, res.status, res.statusText, res);

                return $q.resolve(res);
            },
            responseError: function (res) {
                $log.debug('Recieved response ERROR from %s, status %s %s', res.config.url, res.status, res.statusText, res);

                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[res.status], res);
                return $q.reject(res);
            }
        };
    }]
);

// .factory('AuthService', ['$http', 'Session',
//     function ($http, Session) {
//         var authService = {};

//         authService.login = function (credentials) {
//             return $http.post('/api/login', credentials)
//                     .then(function (res) {
//                         Session.create(res.data.id, res.data.user.id, res.data.user.role);
//                         return res.data.user;
//                     });
//         };

//         authService.isAuthenticated = function () {
//             return !!Session.userId;
//         };

//         authService.isAuthorized = function (authorizedRoles) {
//             if (!angular.isArray(authorizedRoles)) {
//                 authorizedRoles = [authorizedRoles];
//             }
//             return authorizedRoles.indexOf('*') !== -1 ||
//                    (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
//         };

//         return authService;
//     }]
// )

// .service('Session',
//     function () {
//         this.create = function (sessionId, userId, userRole) {
//             this.id = sessionId;
//             this.userId = userId;
//             this.userRole = userRole;
//         };
//         this.destroy = function () {
//             this.id = null;
//             this.userId = null;
//             this.userRole = null;
//         };
//     }
// )

// .config(['$httpProvider',
//     function ($httpProvider) {
//         $httpProvider.interceptors.push(['$injector',
//             function ($injector) {
//                 return $injector.get('AuthInterceptor');
//             }]
//         );
//     }]
// )

// .factory('AuthInterceptor',
//     function ($rootScope, $q, AUTH_EVENTS) {
//         return {
//             responseError: function (response) { 
//                 $rootScope.$broadcast({
//                     401: AUTH_EVENTS.notAuthenticated,
//                     403: AUTH_EVENTS.notAuthorized,
//                     419: AUTH_EVENTS.sessionTimeout,
//                     440: AUTH_EVENTS.sessionTimeout
//                 }[response.status], response);
//                 return $q.reject(response);
//             }
//         };
//     }
// )