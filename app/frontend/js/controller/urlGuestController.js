/**
 * Created by Nathan on 9/2/2016.
 */
angular.module('tinyUrl').controller('urlGuestController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
    $scope.submit = function () {
        $http.post('/api/urls', {
            longUrl: $scope.longUrl
        }).success(function (data) {
            $state.go('home.urlInfo', {shortUrl: data.shortUrl});
        });
    }
}]);