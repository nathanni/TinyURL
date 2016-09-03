/**
 * Created by Nathan on 8/27/2016.
 */
var app = angular.module('tinyUrl', ['ui.router', 'chart.js', 'ngResource', 'ui.bootstrap', 'ngAnimate']);


app.config(function ($stateProvider, $urlRouterProvider) {

    //match all default case, will go to '#/'
    $urlRouterProvider.otherwise('/');

    //match '#/'
    $stateProvider
        .state('home', {
            url: '/',
            views: {
                '': {
                    templateUrl: '/view/home.html',
                    controller: 'homeController as $ctrl'
                },
                'nav@home': {
                    templateUrl: '/view/nav.html'
                },
                'main@home': {
                    templateUrl: '/view/url/urlGuest.html',
                    controller: 'urlGuestController'
                }
            }

        })
        .state('home.urlInfo', {
            url: 'urlInfo/:shortUrl',
            views: {
                'main@home': {
                    templateUrl: '/view/url/urlInfo.html',
                    controller: 'urlInfoController'
                }
            }

        })
});