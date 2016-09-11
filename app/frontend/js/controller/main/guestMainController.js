/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('guestMainController', ['$scope', '$http', '$state',
    function ($scope, $http, $state) {


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

        $scope.submit = function () {

            getValidity(function () {
                $http.post('/api/urls', {
                    longUrl: $scope.longUrl,
                    validity: validity
                }).success(function (data) {
                    $state.go('home.urlInfo', {shortUrl: data.shortUrl});
                });
            });
        }
    }]);