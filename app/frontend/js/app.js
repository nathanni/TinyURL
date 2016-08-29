/**
 * Created by Nathan on 8/27/2016.
 */
var app = angular.module('tinyUrl', ['ui.router']);


app.config(function ($stateProvider, $urlRouterProvider) {

    //match all default case, will go to '#/'
    $urlRouterProvider.otherwise('/');

    //match '#/'
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'view/home.html',
            controller: 'homeController'
        })
        .state('urlInfo', {
            url: '/urlInfo/:shortUrl',
            templateUrl: 'view/urlInfo.html',
            controller: 'urlInfoController'
        })
});