/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('signupController', ['$timeout', '$scope', 'authService', '$state', '$uibModalInstance',
    function ($timeout, $scope, authService, $state, $uibModalInstance) {
        var $ctrl = this;

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };


        $scope.user = {
            username: '',
            password: ''
        };


        $scope.signup = function () {
            $scope.alert = null;
            $scope.success = null;
            authService.register($scope.user).then(function (msg) {
                $scope.success = msg + '\n Automatically login in 3 seconds';
                $timeout(function () {
                    authService.login($scope.user).then(function (msg) {
                        $ctrl.cancel(); //close popup
                        $state.go('home.user', {username: $scope.user.username});
                    }, function (errMsg) {
                        $scope.alert = errMsg;
                    });
                }, 3000);
            }, function (errMsg) {
                $scope.alert = errMsg;
            });
        };

    }]);