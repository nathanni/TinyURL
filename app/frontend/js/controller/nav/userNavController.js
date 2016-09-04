/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('userNavController', ['$rootScope','$scope', 'authService', 'API_ENDPOINT', '$http', '$state',
    function ($rootScope, $scope, authService, API_ENDPOINT, $http, $state) {

        authService.userdash().then(function (data) {
            $rootScope.user = data.user;
            $scope.username = $rootScope.user.username;
        });


        $scope.logout = function () {
            authService.logout();
            $state.go('home');
        };
    }]);