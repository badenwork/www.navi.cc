angular.module('logs', ['ngRoute', 'resources.account', 'resources.system', 'resources.logs', 'pasvaz.bindonce'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/logs', {
        templateUrl:'templates/logs/logs.tpl.html',
        controller:'LogsViewCtrl',
        resolve:{
            account:['Account', function (Account) {
                return Account.get();
            }],
            systems:['System', function (System) {
                return System.getall();
            }],
            logs:[function(){
                return {
                    data: []
                };
            }]
        }
    })
    .when('/logs/:skey', {
        templateUrl:'templates/logs/logs.tpl.html',
        controller:'LogsViewCtrl',
        resolve:{
            account:['Account', function (Account) {
                return Account.get();
            }],
            systems:['System', function (System) {
                return System.getall();
            }],
            logs:['Logs', '$route', function(Logs, $route){
                return Logs.get($route.current.params.skey);
            }]
        }
    });
}])

.controller('LogsViewCtrl', ['$scope', '$location', '$route', '$routeParams', 'account', 'systems', 'logs', function ($scope, $location, $route, $routeParams, account, systems, logs) {
    $scope.account = account.account;
    $scope.systems = systems;
    $scope.skey = $routeParams['skey'];

    $scope.logs = logs.data;
    $scope.comment = "Данные еще не получены";

    $scope.onSysSelect = function(){
        if($scope.skey){
            $location.path('/logs/' + $scope.skey);
        } else {
            $location.path('/logs');
        }
    }

    $scope.onReload = function(){
        $route.reload();
    }
}]);
