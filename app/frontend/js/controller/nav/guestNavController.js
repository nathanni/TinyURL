/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('guestNavController', ['$scope','$uibModal', function ($scope, $uibModal) {

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

    $ctrl.openLogin = function (size) {
        var loginInstance = $uibModal.open({
            animation: $ctrl.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: '/view/authentication/login.html',
            controller: 'loginController',
            controllerAs: '$ctrl',
            size: size,
            resolve: {}
        });

    };




}]);
