/**
 * Created by Nathan on 8/28/2016.
 */
angular.module('tinyUrl').controller('urlInfoController', ['$scope', '$http', '$location', '$stateParams', function ($scope, $http, $location, $stateParams) {
    $http.get('/api/urls/' + $stateParams.shortUrl)
        .success(function (data) {
            $scope.shortUrl = data.shortUrl;
            $scope.longUrl = data.longUrl;
            $scope.shortUrlToShow = $location.protocol() + "://" +
                $location.host() + ":" +
                $location.port() + "/" +
                $scope.shortUrl;
        });
}]);