(function() {

    "use strict";

    angular.module('sg2')

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

    .service('sessionService', ['$q',
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
    .factory('authService', ['$http', 'sessionService', 'USER_ROLES',
        function($http, sessionService, USER_ROLES) {
            var authService = {};

            // Check if client is authorized
            authService.tokenExpired = function() {
                return new Date(sessionService.getField('exp')) <= Math.round(new Date().getTime() / 1000);
            }
            authService.isAuthenticated = function() {
                return !!sessionService.getToken() && !authService.tokenExpired();
            }
            authService.isAuthorized = function(roles) {
                if ((!roles instanceof Array))
                    roles = [roles];

                if (roles.indexOf(USER_ROLES.all) != -1)
                    return true;

                var role = sessionService.getField('role');
                return authService.isAuthenticated() && role && roles.indexOf(role) != -1;
            }
            authService.login = function(credentials) {
                return $http.post('/api/login', credentials)
                        .then(function(res) {   
                            if (res.data.jwtToken)
                                sessionService.saveToken(res.data.jwtToken);
                            return !!res.data.token;
                        }, function(err) {
                            // TODO Login failed
                        });
            }
            authService.logout = function() {
                return sessionService.destroy();
            }

            return authService;
        }]
    )
    .factory('authInterceptor', ['sessionService', '$rootScope', 'AUTH_EVENTS', '$q', '$log',
        function(sessionService, $rootScope, AUTH_EVENTS, $q, $log) {
            return {
                request: function(req) {
                    // Is there a token here? In that case, provide it!
                    var jwtToken = sessionService.getToken();
                    if (jwtToken)
                        req.headers.Authorization = 'Bearer ' + jwtToken;

                    //$log.debug('Sending %s-request to %s', req.method, req.url, req);

                    return $q.resolve(req);
                },
                response: function(res) {
                    // Got a new jwtToken for me?
                    var header = res.headers('Authorization');
                    if (header && header.indexOf('Bearer ') != -1)
                        sessionService.saveToken(header.split(' ')[1]);

                    //$log.debug('Recieved response from %s, status %s %s', res.config.url, res.status, res.statusText, res);

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

}());