/**
 * Created by Nathan on 8/27/2016.
 */
var app = angular.module('tinyUrl', ['ngSanitize','ui.router', 'chart.js', 'ngResource', 'ui.bootstrap', 'ngAnimate', 'ngclipboard']);


app.config(['$httpProvider','$stateProvider','$urlRouterProvider',function ($httpProvider, $stateProvider, $urlRouterProvider) {


    //config EmojiOne
    // #################################################
    // # Optional

    // default is PNG but you may also use SVG
    //emojione.imageType = 'png';

    // default is ignore ASCII smileys like :) but you can easily turn them on
    emojione.ascii = true;

    // if you want to host the images somewhere else
    // you can easily change the default paths
    emojione.imagePathPNG = '../node_modules/emojione/assets/png/';
    emojione.imagePathSVG = '../node_modules/emojione/assets/svg/';

    // #################################################

    //解决Angularjs在IE底下的cache issue, 禁用IE cache
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';




    //match all default case, will go to '#/'
    $urlRouterProvider.otherwise('/');

    //match '#/'
    $stateProvider
        .state('home', {
            url: '/',
            views: {
                '': {
                    templateUrl: 'view/home.html',
                    controller: 'homeController as $ctrl'
                },
                'nav@home': {
                    templateUrl: 'view/nav/guestNav.html'
                },
                'main@home': {
                    templateUrl: 'view/main/guestMain.html',
                    controller: 'guestMainController'
                }
            },
            allowAfterLogin: false,
            allowAnonymous: true
        })
        .state('home.user', {
            url: 'user',
            views: {
                'nav@home': {
                    templateUrl: 'view/nav/userNav.html',
                    controller: 'userNavController'
                },
                'main@home': {
                    templateUrl: 'view/main/userMain.html',
                    controller: 'userMainController'
                }
            },
            allowAfterLogin: true,
            allowAnonymous: false
        })
        .state('home.user.urlInfo', {
            url: '/urlInfo/:shortUrl',
            views: {
                'main@home': {
                    templateUrl: 'view/url/urlInfo.html',
                    controller: 'urlInfoController',
                    resolve: {
                        fromUser: function () {
                            return true;
                        }
                    }
                }
            },
            allowAfterLogin: true,
            allowAnonymous: false
        })
        .state('home.urlInfo', {
            url: 'urlInfo/:shortUrl',
            views: {
                'main@home': {
                    templateUrl: 'view/url/urlInfo.html',
                    controller: 'urlInfoController',
                    resolve: {
                        fromUser: function () {
                            return false;
                        }
                    }
                }
            },
            allowAfterLogin: false,
            allowAnonymous: true

        })
        .state('home.error', {
            url: 'error',
            views: {
                'main@home': {
                    templateUrl: 'view/no_permission.html'
                }
            },
            allowAfterLogin: false,
            allowAnonymous: true
        })
        .state('home.user.error', {
            url: '/error',
            views: {
                'main@home': {
                    templateUrl: '/view/no_permission.html'
                }
            },
            allowAfterLogin: true,
            allowAnonymous: false
        })
}])
    .run(function ($rootScope, $state, authService) {
        $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
            if (!authService.isAuthenticated()) {
                if (!next.allowAnonymous) {
                    event.preventDefault();
                    $state.go('home');
                }
            } else {
                //authService.validate();
                if (!next.allowAfterLogin) {
                    event.preventDefault();
                    $state.go('home.user');
                }
            }
        });
    })
    .controller('appCtrl', ['$scope', '$rootScope', '$state', 'authService', 'AUTH_EVENTS', 'REQUIRE_RELOGIN', 'PERMISSION_EVENTS',
        function ($scope, $rootScope, $state, authService, AUTH_EVENTS, REQUIRE_RELOGIN, PERMISSION_EVENTS) {
            $scope.$on(AUTH_EVENTS.notAuthenticated ,function (event) {
                authService.logout();
                //broadcast session is invalid and go to the login page
                $rootScope.$broadcast(REQUIRE_RELOGIN.sessionInvalid);
                $state.go('home');
            });

            //404 没有访问权限的事件
            $scope.$on(PERMISSION_EVENTS.noPermission, function (event) {
                if(!authService.isAuthenticated()) {
                    $state.go('home.error');
                } else {
                    $state.go('home.user.error');
                }

            })

        }]);
