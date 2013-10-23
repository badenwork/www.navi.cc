angular.module('error', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/error', {
    templateUrl:'templates/error/error.tpl.html',
    controller:'ErrorCtrl'
  });

}])

.controller('ErrorCtrl', ['$scope', '$location', '$route', function ($scope, $location, $route) {
  var manifest = document.querySelector('html').manifest;
  $scope.appcache = btoa(manifest);
}]);
