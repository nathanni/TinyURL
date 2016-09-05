/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('loginController', ['$scope', 'authService', '$state', '$uibModalInstance', 'reLoginAlert',
    function ($scope, authService, $state, $uibModalInstance, reLoginAlert) {
        var $ctrl = this;

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        if(reLoginAlert) {
            $ctrl.reLoginAlert = reLoginAlert;
        }

        $scope.user = {
            username: '',
            password: ''
        };

        $scope.login = function () {
            authService.login($scope.user).then(function (msg) {
                $ctrl.cancel(); //close popup
                $state.go('home.user');
            }, function (errMsg) {
                $scope.alert = errMsg;
            });
        };
    }]);
