angular.module('gps', ['ngRoute', 'resources.account', 'resources.params', 'resources.geogps', 'app.filters', 'config.system.params.master', 'pasvaz.bindonce'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/gps', {
    templateUrl:'templates/gps/gps.tpl.html',
    controller:'GPSViewCtrl',
    resolve:{
      account:['Account', function (Account) {
        return Account.get();
      }],
      systems: ['System', function (System) {
        return System.getall();
      }]
    }
  })
  .when('/gps/:skey', {
    templateUrl:'templates/gps/gps.tpl.html',
    controller:'GPSViewCtrl',
    resolve:{
      account:['Account', function (Account) {
        return Account.get();
      }],
      systems: ['System', function (System) {
        return System.getall();
      }]
    }
  })
  .when('/gps/:skey/:day', {
    templateUrl:'templates/gps/gps.tpl.html',
    controller:'GPSViewCtrl',
    resolve:{
      account:['Account', function (Account) {
        return Account.get();
      }],
      systems: ['System', function (System) {
        return  System.getall();
      }]
    }
  });

}])

.controller('GPSViewCtrl', ['$scope', '$route', '$routeParams', '$location', 'account', 'systems', 'GeoGPS', '$filter', function ($scope, $route, $routeParams, $location, account, systems, GeoGPS, $filter) {
  var day = $scope.day = $routeParams['day'] || 0;

  $scope.skey = $routeParams['skey'];
  $scope.account = account;
  $scope.systems = systems;
  $scope.track = null;

  var date;
  var hourfrom;

  var tz = (new Date()).getTimezoneOffset()/60;

  if((1*day) === 0){
    hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600;
    date = new Date(hourfrom * 3600 * 1000);
  } else if((1*day) === -1){
    hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600 - 24;
  } else {
    hourfrom = day * 24 + tz;
  }
  date = new Date(hourfrom * 3600 * 1000);
  $scope.datetime = hourfrom * 3600;

  // console.log("=> Selected hour range:", hourfrom, hourfrom + 23);
  // console.log("=> Selected date range:", date, new Date((hourfrom + 24) * 3600 * 1000 - 1000));

  $scope.onSysSelect = function(){
    if($scope.skey){
      $location.path('/gps/' + $scope.skey);
    } else {
      $location.path('/gps');
    }
  }

  // $scope.$watch('skey', function(skey){
  //   if($scope.skey !== startskey) {
  //     console.log('reload', $scope.skey, skey);
  //     if(angular.isUndefined(skey) || (skey == null)){
  //       $location.path('/gps');
  //     } else {
  //       $location.path('/gps/' + $scope.skey + '/' + day);
  //     }
  //     //reload();
  //   }
  // });

  $scope.gpsdata = [{lat: 1.0, lon: 1.0}];

  /*var date = new Date();
  var tz = (new Date()).getTimezoneOffset()/60;
  var hourfrom = Math.floor(date.valueOf() / 1000 / 3600 / 24) * 24 + tz;*/

  // var hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600;

  $scope.mapconfig = {
      autobounds: true,   // Автоматическая центровка трека при загрузке
      animation: false,   // Анимация направления трека
      numbers: true,      // Нумерация стоянок/остановок
      centermarker: true
  };

  if($scope.skey && ($scope.skey != '') && ($scope.skey != '+')){
    // console.log('get Track', $scope.skey);
    GeoGPS.select($scope.skey);
    GeoGPS.getTrack(hourfrom, hourfrom+23)
        .then(function(data){
            $scope.track = data;
            /*$scope.track = data;
            $scope.points = data.track.length;
            fake_timeline();*/
        });

    $scope.onMouseOver = function(g) {
      $scope.center = g;
      //console.log('onmouseover', g);
    };
  }

  var dp = $('#inputDate').datepicker({
    // date: "12-02-2012",
    // dateFormat: "dd-mm-yyyy",
    // format: "dd-mm-yyyy",
    // value: "03-02-2012",
    // format: "mm-dd-yyyy",
    // todayHighlight: true,
    language: "ru",
    todayBtn: "linked",
    autoclose: true
    // autoclose: true,
    // weekStart: "1"
    // format:'d.m.Y',
    // date: "14.05.2012",
    // format:'m/d/Y',
    // date: $('#inputDate').val(),
    // current: $('#inputDate').val(),
    // starts: 1,
    // position: 'r',
    // onBeforeShow: function(){
    //   $('#inputDate').DatePickerSetDate($('#inputDate').val(), true);
    // }
  }).on('changeDate', function(ev){
    $scope.$apply(function(){
      var date = ev.date;
      // var hourfrom = date.valueOf() / 1000 / 3600 + tz;
      var newday = (date.valueOf() / 1000 / 3600 - tz) / 24;
      // console.log('datepick=', newday);
      $location.path('/gps/' + $scope.skey + '/' + newday);
      // dp.datepicker("hide");

    });
    // this.hide();
  });
  // dp.datepicker("setValue", "01-02-2012");
  // dp.datepicker("setDate", new Date(381909 * 3600 * 1000));
  // setTimeout(function(){
    // dp.datepicker("update", "01-02-2012");
    // dp.datepicker("update", new Date(1373911877014));
    // console.log("date=", );

    // Имеет баг (я так думаю) UTC
    dateline = dp.datepicker.DPGlobal.formatDate(new Date(date.valueOf() - tz * 3600 * 1000), "mm-dd-yyyy", "ru");
    dp.datepicker("update", dateline);
    // console.log("date", date, offset, dateline);
  // }, 0);
    // dp.datepicker("show");

  // var nowTemp = new Date();
  // var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate() + 1, 0, 0, 0, 0);
  // dp.datepicker("setValue", now);

  $scope.selectday = function(day){
    $location.path('/gps/' + $scope.skey + '/' + day);
  }

  /*$scope.onSelect = function(){
    console.log('onSelect', $scope.system, $scope.skey);
    //$location.path(s);
    //$location.path('/gps/' + $scope.system);
  }*/
}]);
