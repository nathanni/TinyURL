/**
 * Created by Nathan on 8/28/2016.
 */
angular.module('tinyUrl').controller('urlInfoController', ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
    $http.get('/api/urls/'+$stateParams.shortUrl)
        .success(function (data) {
            $scope.shortUrl = data.shortUrl;
            $scope.longUrl = data.longUrl;
            $scope.shortUrlToShow =  "http://localhost:3000/" + $scope.shortUrl;
        });
}]);