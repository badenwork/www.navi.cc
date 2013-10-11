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
        // Нужен список систем
        return System.getall();
      }],
      logs:['Logs', function(Logs){
        return Logs;
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
        // Нужен список систем
        return System.getall();
      }],
      logs:['Logs', '$route', function(Logs, $route){
        // var skey = $route.current.params.skey;
        // console.log('skey=', skey);
        return Logs.get($route.current.params.skey);
      }]
    }
  });
}])

.controller('LogsViewCtrl', ['$scope', '$location', '$routeParams', 'account', 'systems', 'logs', function ($scope, $location, $routeParams, account, systems, logs) {
  $scope.account = account.account;
  $scope.systems = systems;
  // var startskey = $routeParams['skey'];
  // $scope.skey = account.skey;
  $scope.skey = $routeParams['skey'];

  $scope.logs = logs.data;
  console.log('$scope.logs = ', $scope.logs);
  $scope.comment = "Данные еще не получены";
  // $scope.onSelect = function(){
  //   console.log('selected');
  // };

  // var reload = function(){
  //   console.log('reload', $scope.account.skey);
  //   if((!$scope.account.skey) || ($scope.account.skey === "")) {
  //     return;
  //   }
  //   $scope.logs.logs = [];
  //   $scope.comment = "Данные загружаются...";
  //   console.log(['change skey', $scope.account.skey, $scope.account]);
  //   $scope.logs.get($scope.account.skey, $scope.account.akey, function(res){
  //     if(res === 0) {
  //       $scope.comment = "Нет событий.";
  //     } else {
  //       $scope.comment = "Неизвестно";
  //     }
  //   });
  // };

  // $scope.onReload = function(){
  //   reload();
  // };

  $scope.onSysSelect = function(){
    console.log('skey=', $scope.skey, $location);
    if($scope.skey){
      $location.path('/logs/' + $scope.skey);
    } else {
      $location.path('/logs');
    }
  }
  // reload();
}]);
