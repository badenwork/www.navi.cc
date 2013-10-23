(function(){


angular.module('app', [
    'http-auth-interceptor',
    'ngRoute',
    'resources.account',
    'app.filters',
    'error',
    'login',
    'register',
    'map',
    'logs',
    'gps',
    'reports',
    'config',
    'admin',
    'help',
    'i18n',
    'directives.loginform',
    // 'templates',
    // 'templatesjade',
    // '$strap',
    // 'services.i18n',
    // 'services.i18nNotifications',
    'services.httpRequestTracker'
    // 'templates'
]);

var DEVELOP = ((location.hostname === 'localhost') || (location.hostname === 'bigbrother') || (location.hostname.match(/192\.168\.*/)));
var API_VERSION = "1.0";

angular.module('app').constant('SERVER', {
    //api: "http://" + (DEVELOP ? "gpsapi05.navi.cc:8982" : location.hostname) + '/' + API_VERSION,
    api: (DEVELOP ? 'http://new.navi.cc/' : '/') + API_VERSION,
    //channel: 'ws://' + (DEVELOP ? "gpsapi05.navi.cc" : location.hostname) + ':8983/websocket',
    channel: 'ws://' + (DEVELOP ? "new.navi.cc" : location.hostname) + ':8983/websocket',
    api_withCredentials: true    // Должен быть установлен для использования withCredentials, в противном случае используется авторизация через Header:
});

// angular.module('app').config(['$routeProvider', '$locationProvider', '$httpProvider', /*'$compileProvider',*/ 'SERVER', function ($routeProvider, $locationProvider, $httpProvider, /*$compileProvider,*/ SERVER) {
angular.module('app').config(['$routeProvider', '$locationProvider', '$httpProvider', 'SERVER', function ($routeProvider, $locationProvider, $httpProvider, SERVER) {
    $httpProvider.defaults.withCredentials = SERVER.api_withCredentials;

    // Разрешим вызывать ссылки вида chrome:.... Не пригодилось, ссылки вида chrome браузер блокирует
    // $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);

    if(!$httpProvider.defaults.headers.patch) {
        $httpProvider.defaults.headers.patch = {};
    }
    $httpProvider.defaults.headers.patch["Content-Type"] = 'application/json; charset=utf-8';

    //$locationProvider.html5Mode(true);
}]);

var TIMETICK_UPDATE = 30000;  // Отправлять глобальное событие каждые 30 секунд.
// TIMETICK_UPDATE = 1000;  // Отправлять глобальное событие каждые 30 секунд.

angular.module('app').run(['$http', 'SERVER', '$rootScope', '$timeout', function($http, SERVER, $rootScope, $timeout){

  $rootScope.now = function(){
    return Math.round((new Date()).valueOf() / 1000);
  }
  var timetick = function(){
    // $rootScope.now = Math.round((new Date()).valueOf() / 1000);
    $rootScope.$broadcast("timetick");

    $timeout(function(){
        timetick();
    }, TIMETICK_UPDATE);

}]);

angular.module('app').controller('AppCtrl', ['$scope', '$location', '$route', '$rootScope', '$window', function($scope, $location, $route, $rootScope, $window) {
    $scope.location = $location;
    $scope.$route = $route;
    $scope.debugpanel = "";
    $scope.showDebugPanel = function(){
        $scope.debugpanel = ($scope.debugpanel === "") ? "active" : "";
    }

    // Функционал всплывающих ссобщений необходимо восстановить
    //
    // $scope.removeNotification = function (notification) {
    //   i18nNotifications.remove(notification);
    // };

<<<<<<< HEAD
if(0){
//angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'notifications', 'httpRequestTracker', function ($scope, $location, $route, notifications, httpRequestTracker) {
angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'Account', 'httpRequestTracker', function ($scope, $location, $route, Account, httpRequestTracker) {
  $scope.location = $location;
  $scope.account = Account;
  $scope.skey = Account.skey;

  // console.log('update Header');

  $scope.home = function () {
    /*if ($scope.currentUser.isAuthenticated()) {
      $location.path('/map');
    } else {*/
      $location.path('/login');
    //}
  };

  $scope.isNavbarActive = function (navBarPath) {
    //console.log('isNavbarActive(', navBarPath, $location, '123');
    //return navBarPath === $location.path();
    return $location.path().match(navBarPath);
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };

  /*$scope.collapse = function() {
    $(".collapse").collapse('toggle');
  };*/
  $scope.$on('$routeChangeSuccess', function (scope, next, current) {
    $(".collapse").collapse('hide');
    $('.modal-backdrop').remove();
  });
  /*$(".collapse").collapse({toggle: false});*/
=======
    // $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    //     i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
    // });
>>>>>>> 02f9352250f87b053cd24e988249fd68f72465db

}]);


})();
