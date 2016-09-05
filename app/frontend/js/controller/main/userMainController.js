/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('userMainController', ['$rootScope', '$scope', '$http', '$state',
    function ($rootScope, $scope, $http, $state) {
        $scope.submit = function () {
            $http.post('/api/user/urls', {
                longUrl: $scope.longUrl,
                user: $rootScope.user.username
            }).success(function (data) {
                $state.go('home.user.urlInfo', {user: $rootScope.user.username, shortUrl: data.shortUrl});
            });
        }

    }]);