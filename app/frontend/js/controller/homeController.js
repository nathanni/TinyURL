/**
 * Created by Nathan on 8/28/2016.
 */
angular.module('tinyUrl').controller('homeController', ['$scope','$uibModal', function ($scope, $uibModal) {
    $scope.navView = 'nav';
    $scope.mainView = 'main';

    var $ctrl = this;

    $ctrl.animationsEnabled = true;

    $ctrl.openSignup = function (size) {
        var signupInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: '/view/authentication/signup.html',
            controller: 'signupController',
            controllerAs: '$ctrl',
            size: size,
            resolve: {}
        });

    };
}]);



