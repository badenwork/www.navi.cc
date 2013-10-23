angular.module('login', ['ngRoute', 'resources.account', 'resources.system', 'app.filters', '$strap.directives', /*'directives.modal',*/ 'i18n', 'directives.language'])

.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/', {
        templateUrl:'templates/login/login.tpl.html',
        controller:'LoginViewCtrl',
        resolve:{
            account:['Account', function (Account) {
                return Account.get();
            }],
            systems:['System', function (System) {
                return System.getall();
            }]
        }
    });
}])

.controller('LoginViewCtrl', ['$scope', 'account', 'systems', function ($scope, account, systems) {
    $scope.account = account;
    $scope.systems = systems;

    $scope.onLogout = function(){
        account.logout().then(function(){
            location.reload();
        });
        $scope.user = {};
    };
}]);


