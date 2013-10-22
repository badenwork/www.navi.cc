angular.module('register', ['ngRoute', 'i18n', 'ui.bootstrap.buttons', 'resources.account', 'ngAnimate', 'directives.lists'])

.config(['$routeProvider', function ($routeProvider) {

  $routeProvider.when('/register', {
    templateUrl:'templates/login/register.tpl.html',
    controller:'RegisterViewCtrl',
    resolve:{
      account:['Account', function (Account) {
          return Account;
      }]
    }
  });

}])

.controller('RegisterViewCtrl', ['$scope', '$location', 'account', '$timeout', function ($scope, $location, account, $timeout) {
  // console.log('RegisterViewCtrl controller', account);

  $scope.user = {
    newgroup: true
  };

  $scope.showRealName = false;
  $scope.showEmail = false;
  $scope.showGroup = false;

  $scope.groupCmd = "Не создавать группу";

  $scope.registerUser = function(){
    $scope.error = false;
    $scope.showerror = false;
    console.log('registerUser', $scope.user);
    var credentials = {
      username: $scope.user.username,
      password: $scope.user.password
    };

    if($scope.showRealName) {
      credentials['title'] = $scope.user.title;
    }

    if($scope.showEmail) {
      credentials['email'] = $scope.user.email;
    }

    if($scope.showGroup) {
      credentials['newgroup'] = $scope.user.newgroup;
      credentials['groupname'] = $scope.user.groupname;
      credentials['grouppassword'] = $scope.user.grouppassword;
    }

    account.register(credentials).then(function(result){
      console.log('registerUser success result', result);
      $('#registerMessage').modal();
    }, function(result){
      $scope.error = result;
      $scope.showerror = true;
      $timeout(function(){
        $scope.showerror = false;
      }, 3000);
      // console.log('registerUser fail result', result);
    });

  }

  $timeout(function(){
    $('#bugfix0001').removeAttr('style');
  }, 2000);

}]);


