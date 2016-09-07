/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('userMainController', ['$location', '$rootScope', '$scope', '$http', '$state',
    function ($location, $rootScope, $scope, $http, $state) {

        $scope.urls = [];

        //get all urls in list
        $http.get('/api/user/urls')
            .success(function (data) {
                $scope.urls = data;
            });



        $scope.dateFormat = 'MMM d, yyyy hh:mm:ss a';

        $scope.prefix = $location.protocol() + "://" +
                        $location.host() + ":" +
                        $location.port() + "/";


        $scope.reverseSort = true;  //descending as default



        $scope.submit = function () {
            $http.post('/api/user/urls', {
                longUrl: $scope.longUrl,
                user: $rootScope.user.username
            }).success(function (data) {
                $state.go('home.user.urlInfo', {shortUrl: data.shortUrl});
            });
        }

    }]);