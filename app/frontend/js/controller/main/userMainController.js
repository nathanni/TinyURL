/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('userMainController', ['$window', '$location', '$rootScope', '$scope', '$http', '$state',
    function ($window, $location, $rootScope, $scope, $http, $state) {


        var validateTime = {
            'forever': -1,
            'OneMinute': 60 * 1000,
            'oneHour': 60 * 60 * 1000,
            'oneDay': 24 * 60 * 60 * 1000,
            'oneMonth': 30 * 24 * 60 * 60 * 1000,
            'oneYear': 12 * 30 * 24 * 60 * 60 * 1000
        };


        $scope.validitySelect = 'forever';
        $scope.months = "";
        $scope.days = "";
        $scope.hours = "";
        $scope.minutes = "";

        var validity;
        var getValidity = function (callback) {
            if ($scope.validitySelect === 'customize') {
                var months = parseInt($scope.months) * validateTime.oneMonth || 0;
                var days = parseInt($scope.days) * validateTime.oneDay || 0;
                var hours = parseInt($scope.hours) * validateTime.oneHour || 0;
                var minutes = parseInt($scope.minutes) * validateTime.OneMinute || 0;
                validity = months + days + hours + minutes || -1;

            } else {
                validity = validateTime[$scope.validitySelect];
            }
            callback();
        };


        $scope.urls = [];

        //get all urls in list

        var getUrls = function () {
            $http.get('/api/users/urls')
                .success(function (data) {
                    $scope.urls = data;
                    emojione.imageType = 'svg';
                    $scope.urls.forEach(function (url) {
                        url.emojiUrlToShow = emojione.shortnameToImage(url.emojiUrl);
                        url.emojiUrlToClick = emojione.shortnameToUnicode(url.emojiUrl);
                        url.isValid = true;
                        if (url.validity != -1) {
                            var expirationTime = new Date(new Date(url.createdTime).getTime() + url.validity);
                            if (expirationTime < new Date()) {
                                url.isValid = false;
                            }
                        }
                    });
                });
        };


        getUrls();

        $scope.urlPrefix =  $location.host();
        if ($location.port() != '80') {
            $scope.urlPrefix += ':' + $location.port();
        }
        $scope.urlPrefix += '/';
        $scope.fullUrlPrefix = $location.protocol() + '://' + $scope.urlPrefix;

        $scope.dateFormat = 'MMM d, yyyy hh:mm a';


        $scope.reverseSort = true;  //descending as default


        $scope.submit = function () {
            getValidity(function () {
                $http.post('/api/users/urls', {
                    longUrl: $scope.longUrl,
                    user: $rootScope.user.username,
                    validity: validity
                }).success(function (data) {
                    $state.go('home.user.urlInfo', {shortUrl: data.shortUrl});
                })
                    .error(function (data) {
                        if (data === 'Too many requests') {
                            $state.go('home.user.error', {errorType: 'tooManyRequests'});
                        }
                    });
            });

        };

        $scope.delete = function (shortUrl) {
            var delShortUrl = $window.confirm('Are you absolutely sure you want to delete this shortUrl?');

            if (delShortUrl) {
                $http.delete('/api/users/urls/' + shortUrl)
                    .success(function (data) {
                        if (data.success) {
                            console.log('delete success');
                        } else {
                            console.log('delete fail');
                        }
                        getUrls();
                    });
            }
        };


    }]);