/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl')

    .service('authService', ['$state', '$q', '$http', 'API_ENDPOINT', function($state, $q, $http, API_ENDPOINT) {
        var LOCAL_TOKEN_KEY = 'yourTokenKey';
        var isAuthenticated = false;
        var authToken;

        function loadUserCredentials() {
            var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
            if (token) {
                useCredentials(token);
            }
        }

        function storeUserCredentials(token) {
            window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            useCredentials(token);
        }

        function useCredentials(token) {
            isAuthenticated = true;
            authToken = token;

            // Set the token as header for your requests!
            $http.defaults.headers.common.Authorization = authToken;
        }

        function destroyUserCredentials() {
            authToken = undefined;
            isAuthenticated = false;
            $http.defaults.headers.common.Authorization = undefined;
            window.localStorage.removeItem(LOCAL_TOKEN_KEY);
        }

        var register = function(user) {
            return $q(function(resolve, reject) {
                $http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
                    if (result.data.success) {
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        var login = function(user) {
            return $q(function(resolve, reject) {
                $http.post(API_ENDPOINT.url + '/login', user).then(function(result) {
                    if (result.data.success) {
                        storeUserCredentials(result.data.token);
                        resolve(result.data.msg);
                    } else {
                        reject(result.data.msg);
                    }
                });
            });
        };

        var userdash = function() {
            return $q(function(resolve) {
                $http.get(API_ENDPOINT.url + '/userdash').then(function(result) {
                    if (result.data.success) {
                        resolve(result.data);
                    }
                });
            });
        };


        var logout = function() {
            destroyUserCredentials();
        };

        loadUserCredentials();

        return {
            login: login,
            register: register,
            logout: logout,
            userdash: userdash,
            isAuthenticated: function() {return isAuthenticated;},
        };
    }])

    .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });