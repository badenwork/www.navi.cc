(function(){


angular.module('app', [
  'http-auth-interceptor',
  'ngRoute',
  'resources.account',
  'app.filters',
  'app.filters.i18n',
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

// 'http://new.navi.cc'

angular.module('app').constant('SERVER', {
  //api: "http://" + (DEVELOP ? "gpsapi05.navi.cc:8982" : location.hostname) + '/' + API_VERSION,
   api: (DEVELOP ? 'http://new.navi.cc/' : '/') + API_VERSION,
  //channel: 'ws://' + (DEVELOP ? "gpsapi05.navi.cc" : location.hostname) + ':8983/websocket',
   channel: 'ws://' + (DEVELOP ? "new.navi.cc" : location.hostname) + ':8983/websocket',
  api_withCredentials: true    // Должен быть установлен для использования withCredentials, в противном случае используется авторизация через Header:
});

// angular.module('app').constant('globals', {
//   locale: 'ru'
// });

angular.module('app').config(['$routeProvider', '$locationProvider', '$httpProvider', 'SERVER', function ($routeProvider, $locationProvider, $httpProvider, SERVER) {
// angular.module('app').config(['$routeProvider', '$locationProvider', '$httpProvider', /*'$compileProvider',*/ 'SERVER', function ($routeProvider, $locationProvider, $httpProvider, /*$compileProvider,*/ SERVER) {
  // console.log(['! App CONFIG !', $httpProvider, SERVER]);
  $httpProvider.defaults.withCredentials = SERVER.api_withCredentials;

  // Разрешим вызывать ссылки вида chrome:.... Не пригодилось, ссылки вида chrome браузер блокирует
  // $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);

  if(!$httpProvider.defaults.headers.patch) {
    $httpProvider.defaults.headers.patch = {};
  }
  $httpProvider.defaults.headers.patch["Content-Type"] = 'application/json; charset=utf-8';

  if(0){
  // Перехват 401 Ошибка авторизации
  var interceptor = ['$rootScope', '$q', function (scope, $q) {
    function success(response) {
      return response;
    }
    function error(response) {
        var status = response.status;

        if (status == 401) {
            window.location = "/#/login"; // Если пользователь неавторизован, то перенаправить на страницу /#/login
            return;
        }
        // otherwise
        return $q.reject(response);

    }
    return function (promise) {
        return promise.then(success, error);
    }
  }];
  $httpProvider.responseInterceptors.push(interceptor);
  }

  //$locationProvider.html5Mode(true);
  //$routeProvider.otherwise({redirectTo:'/login'});
  //$routeProvider.otherwise({redirectTo:'/error'});
}]);

var TIMETICK_UPDATE = 30000;  // Отправлять глобальное событие каждые 30 секунд.
// TIMETICK_UPDATE = 1000;  // Отправлять глобальное событие каждые 30 секунд.

angular.module('app').run(['$http', 'SERVER', '$rootScope', '$timeout', function($http, SERVER, $rootScope, $timeout){
  // console.log(['! App RUN ! ', $http.defaults, SERVER]);

  $rootScope.now = function(){
    return Math.round((new Date()).valueOf() / 1000);
  }
  $rootScope.$on('$routeChangeSuccess', function (event, current) {
      $('.modal-backdrop').remove();
  });
  var timetick = function(){
    // $rootScope.now = Math.round((new Date()).valueOf() / 1000);
    $rootScope.$broadcast("timetick");
    $timeout(function(){
      timetick();
    }, TIMETICK_UPDATE);
  }

  $timeout(function(){
    timetick();
  }, TIMETICK_UPDATE);

}]);

angular.module('app').controller('AppCtrl', ['$scope', '$location', '$route', '$rootScope', '$window', function($scope, $location, $route, $rootScope, $window) {
  // console.log('app:AppCtrl', $location /*, $location.parse()*/);
  // $scope.i18n = i18n;

  // $scope.notifications = i18nNotifications;
  // $scope.account = Account;
  $scope.location = $location;
  $scope.$route = $route;
  // $rootScope.skey = 'test';

  // $scope.$watch('account.skey', function(skey){
  //   // if(!skey) return;
  //   console.log('++=> account.skey = ', skey, $scope.account.skey);
  //   // var params = $route.current.params;
  //   // params.skey = skey;
  //   // var search = $location.search(params).path($route.current.path);
  //   // var search = $location.search('skey', skey);
  //   // $location.path();
  //   // var search = 0;
  //   // console.log("++=> params = ", params, search);
  // //   // console.log('++=> ', $route.current.params /*, $location.parse()*/);
  // });

  // $scope.$on('$routeChangeSuccess', function(angularEvent, current, previous){
  //   // console.log('$routeChangeSuccess ', [angularEvent, current, previous]);
  //   Account.skey = current.params.skey;
  //   // if(current.params.skey && !Account.skey){
  //     // Account.setSkey(current.params.skey);
  //   // }
  //       // console.log('Changing route from ' + angular.toJson(current) + ' to ' + angular.toJson(next));
  // });

  // $scope.removeNotification = function (notification) {
  //   i18nNotifications.remove(notification);
  // };

  // $scope.$on('$routeChangeError', function(event, current, previous, rejection){
  //   i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
  // });
  $scope.debugpanel = "";
  $scope.showDebugPanel = function(){
    $scope.debugpanel = ($scope.debugpanel === "") ? "active" : "";
  }

}]);

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
  });
  /*$(".collapse").collapse({toggle: false});*/

}]);
}


})();
