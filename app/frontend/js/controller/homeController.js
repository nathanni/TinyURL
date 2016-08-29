/**
 * Created by Nathan on 8/28/2016.
 */

angular.module('tinyUrl').controller('homeController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
    $scope.submit = function () {
        $http.post('/api/urls', {
            longUrl: $scope.longUrl
        }).success(function (data) {
            $state.go('urlInfo', {shortUrl: data.shortUrl});
        });
    }
}]);