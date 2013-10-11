angular.module('reports', ['ngRoute', 'resources.account', '$strap.directives','resources.geogps', 'resources.system'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/reports', {
    templateUrl:'templates/reports/reports.tpl.html',
    controller:'ReportsViewCtrl',
    resolve:{
      account:['Account', function (Account) {
        //TODO: sure for fetch only one for the current user
        return Account.get();
      }],
      systems: ['System', function (System) {
        return System.getall();
      }]
    },
    reloadOnSearch: false
  }).
  when('/reports/:skey', {
    templateUrl:'templates/reports/reports.tpl.html',
    controller:'ReportsViewCtrl',
    resolve:{
      account:['Account', function (Account) {
        //TODO: sure for fetch only one for the current user
        return Account.get();
      }],
      systems: ['System', function (System) {
        return System.getall();
      }]
    },
    reloadOnSearch: false
  });
}])
.value('$strapConfig', {
  datepicker: {
    /*beforeShowDay: function(date) {
      console.log("beforeShowDay");
      return 'disabled';//GeoGPS.checkDay(day)?'enabled':'disabled';
    },*/
    autoclose: true,
    language: 'ru'
  }
})
/*
{
 title: "Имя шаблона",
 actions: [
        id: "stop",
        title: "translateKey"
 ],
data: [
    id: "Период",
    title: "translateKey"
]
}*/
.controller('ReportsViewCtrl', ['$scope', '$location', 'account', '$http','SERVER','GeoGPS', 'System', 'systems', '$route',function ($scope, $location, account, $http, SERVER, GeoGPS, System, systems, $route) {
  $scope.account = account;
  $scope.systems = systems;
  $scope.geocoder = new google.maps.Geocoder();


  $scope.showReportWindow = function() {
      // console.log("showReportWIndow");
      // bs-modal="'modal.html'"
      if ($scope.report.systemKey == "")
          $scope.report.systemKey = $scope.account.account.skeys[0];
      var options = {};
      $('#reportSettingsModal').modal(options);
    };

  $scope.refreshLink = function() {
  var link = $('<a />')
  link.attr("href", getXLSXDownloadLink ($scope.report))
  link.attr("download", $scope.report.title+".xlsx")
  link[0].click();
  };

  $scope.report = {
    "interval":{
      "start": new Date(),
      "end": new Date(),
      "radio":{
        "perDay": false,
        "perInterval": true,
        "value" : "perInterval"
      }
    },
    "systemKey": "",
    "templateId": "0",
    "reportGenerated": false,
    "repotSelectedIntervalNotHaveEvents" : false,
  "reportSplittedByDays": true,
    "reportData": {
      rows: [],
      days: [],
      summary: {}
    },
    "hasFuelSensor": false

  };

  $scope.getFuel = function(data){
  if($scope.fuelMap == undefined) return;
  var voltage = data*$scope.fuelMap[$scope.fuelMap.length-1].voltage/1024;

  for(var i = 1; i < $scope.fuelMap.length; i++){
    if(voltage==$scope.fuelMap[i-1].voltage) return $scope.fuelMap[i].liters;
    if($scope.fuelMap[i-1].voltage<voltage && voltage<$scope.fuelMap[i].voltage){
    var otnosh = (voltage - $scope.fuelMap[i-1].voltage)/($scope.fuelMap[i].voltage - $scope.fuelMap[i-1].voltage)

    var liters = $scope.fuelMap[i-1].liters + otnosh*($scope.fuelMap[i].liters - $scope.fuelMap[i-1].liters)

    return liters

    }
  }
  return $scope.fuelMap[$scope.fuelMap.length-1].liters
  }

  $scope.formatPosition = function(index){
        if(index==$scope.report.reportData.rows.length || $scope.report.reportData.rows.length == 0)return;

      var fsource = $scope.report.reportData.rows[index].fsource;
      if(fsource==6||fsource==8) {
        $scope.formatPosition(index+1);
        return;
      }

      $scope.geocoder.geocode({'latLng': new google.maps.LatLng($scope.report.reportData.rows[index].lat, $scope.report.reportData.rows[index].lon) },
        function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
          $scope.report.reportData.rows[index].address = '';

        var parts = results[0].address_components;
          for(var i = parts.length-1; i>=0;--i){
          $scope.report.reportData.rows[index].address +=parts[i].long_name + ((i==0)?'':', ')
        }

        setTimeout(function(){$scope.formatPosition(index+1)},1000);

        } else {
          //повторно запросить
        setTimeout(function(){$scope.formatPosition(index)},3000);
        }
        });
      }

  //смена статуса
  $scope.zapravka = function(value,delta,str){
    if($scope.report.hasFuelSensor && Math.abs(value)>delta){
      if(value<0) return "Слив топлива";
      return "Заправка";
    }
    return str;
  }

  //подсчет расстояния
  $scope.distance = function (p1, p2) {
     var R = 6371; // km (change this constant to get miles)
     var dLat = (p2.lat-p1.lat) * Math.PI / 180;
     var dLon = (p2.lon-p1.lon) * Math.PI / 180;
     var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1.lat * Math.PI / 180 ) * Math.cos(p2.lat * Math.PI / 180 ) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
     var d = R * c;
     return d;
  }
  $scope.parseData = function(data){
     $scope.report.reportData.rows.length=0
     if (!data || !data.points || data.points.length == 0) {
         $scope.report.reportGenerated = false;
         $scope.report.repotSelectedIntervalNotHaveEvents = true;
          return;
      } else {
          $scope.report.repotSelectedIntervalNotHaveEvents = false;
      }
       var items = data.ranges.reverse();
     var points = data.points;
     var days = [];
     for(var i=0; i < $scope.report.reportData.days.length; ++i){
       days[$scope.report.reportData.days[i].str]=$scope.report.reportData.days[i];
     }
      var tzdt = (new Date()).getTimezoneOffset() * 60;
       for(var i = 0; i < items.length; ++i){
       var start = items[i].start;
     var stop = points[items[i].stop_index-1];
     var item = items[i].start;

     //начало и конец сообытия
     item.startdt=item.dt;
     item.finishdt=stop.dt;
     //продолжительность
     item.durationSecs =(item.finishdt - item.startdt);
       item.duration = moment.duration((item.finishdt - item.startdt)*1000).humanize()

     //уровень и изменение топлива
     if(!item.fuel){
             //items[i].stop.fuel = points[items[i].stop_index-1].fuel
         }
     item.fuel = Math.floor(10*$scope.getFuel(item.fuel))/10
     if(!stop.fuel){
             stop.fuel = points[items[i].stop_index].fuel
         }
     item.fuelChange = - Math.floor(10*(item.fuel - $scope.getFuel(stop.fuel)))/10

     var dist = 0;

       for(var j = items[i].start_index; j<items[i].stop_index; ++j){
        var p1 = points[j];
      var p2 = points[j+1];
      if(j==items[i].stop_index){
        p2=p1;
      }
      dist+=$scope.distance(p1,p2);
     }
     //расстояние
     item.distanceRaw = dist;
     item.distance = Math.floor(dist*10)/10;
     //средняя скорость
     item.speed = (item.durationSecs!=0)?(Math.floor(36000*item.distance/(item.durationSecs))/10):""
     //погрешность (литров)
     var delta = 1
     //форматирование дат
     item.startdt=moment(item.startdt*1000).format("DD/MM HH:mm")
     item.finishdt=moment(item.finishdt*1000).format("DD/MM HH:mm");
     //Форматирование координат
     item.lat = Math.floor(item.lat*10000)/10000;
     item.lon = Math.floor(item.lon*10000)/10000;

         item.position = item.lat + " " + item.lon;

       switch(item.fsource){
        case 7:
        case 2:
        case 3:
            item.event = $scope.zapravka(item.fuelChange,delta,"Стоянка")
            break;
        case 4:
            item.event = $scope.zapravka(item.fuelChange,delta,"Остановка")
            break;
        case 6:
        case 8: item.event = "Движение"; item.position = "";
            break;
        default: item.event = item.fsource;
            break;
     }
     days[new Date((start.dt - tzdt)*1000).toDateString()].events.push(item);
     $scope.report.reportData.rows.push(item);
      }

     $scope.formatPosition(0);

     //gererate filename
     $scope.report.title = $scope.systems[$scope.report.systemKey].title
       +"_"+moment($scope.report.interval.start).format("DD/MM/YYYY")
       +"_"+moment($scope.report.interval.end).format("DD/MM/YYYY")

     // SUMMARY GENERATION

     var summary = { distance:0, moveDuration:0, stopDuration:0, fuel:0};
     for(var i = 0; i<$scope.report.reportData.rows.length; ++i){
       var item = $scope.report.reportData.rows[i]
     summary.distance += item.distanceRaw

     if(item.fsource==6||item.fsource==8) summary.moveDuration += item.durationSecs
     else summary.stopDuration += item.durationSecs

     //Расход топлива идет со знаком минус.
     summary.fuel -= (item.fuelChange<0)?item.fuelChange:0
     }
     summary.distance = Math.floor(summary.distance*100)/100
     summary.fuel = Math.floor(summary.fuel*10)/10
     summary.speed = (summary.durationSecs!=0)?(Math.floor(36000*summary.distance/(summary.moveDuration))/10):""

     //max speed finding
     summary.maxspeed = 0;
     for(var i = 0; i < points.length; i++){
      summary.maxspeed = (summary.maxspeed>points[i].speed)?summary.maxspeed:points[i].speed
     }
     summary.maxspeed = Math.floor(summary.maxspeed*10)/10

     summary.moveDuration =  moment.duration((summary.moveDuration )*1000).humanize()
     summary.stopDuration =  moment.duration((summary.stopDuration )*1000).humanize()
     $scope.report.reportData.summary = summary

     // END OF SUMMARY GENERATION
     $scope.report.reportGenerated = true;
  }
  $scope.report.generateReport = function () {
    var reportTable = $( "#reportT" );
    var sys = systems[$scope.report.systemKey];
    $scope.report.hasFuelSensor = sys.car.hasFuelSensor;
    if((sys.params) && (sys.params.fuel)){
        $scope.fuelMap = sys.params.fuel;
    }

  $scope.report.interval.start.setHours(0)
  $scope.report.interval.start.setMinutes(0)
  $scope.report.interval.start.setSeconds(0)


    if ($scope.report.interval.radio.value == 'perDay') {
      $scope.report.interval.end = moment($scope.report.interval.start).add('d',1).subtract('s',1).toDate();
    }
  $scope.report.interval.end.setHours(23)
  $scope.report.interval.end.setMinutes(59)
  $scope.report.interval.end.setSeconds(59)

  var tz = (new Date()).getTimezoneOffset()/60;
  var from = Math.floor(($scope.report.interval.start)/1000/3600 + tz);
  var to = Math.floor(($scope.report.interval.end)/1000/3600 + tz);
  GeoGPS.select($scope.report.systemKey);
  var items = GeoGPS.getTrack(from,to);

  //очистка массива дней
  for(var i = 0; i<$scope.report.reportData.days.length; ++i){
    $scope.report.reportData.days[i].events.length = 0;
  }
  $scope.report.reportData.days.length=0;

  var day = {date:$scope.report.interval.end};
  var cmpStr = moment($scope.report.interval.start).subtract('d',1).toDate().toDateString();

  while(cmpStr != day.date.toDateString()){
    day.events = [];
    day.str = day.date.toDateString();
      day.strFormatted = moment(day.date).format("DD/MM/YYYY")
    $scope.report.reportData.days.push(day);
    day = {date:moment(day.date).subtract('d',1).toDate()};
  }


  items.then($scope.parseData);
  /*if (!$scope.report.reportGenerated) {
      $scope.report.repotSelectedIntervalNotHaveEvents = true;
  } else {
      $scope.report.repotSelectedIntervalNotHaveEvents = false;
  }*/
    $('#reportSettingsModal').modal('hide');
  };

  $scope.templates = [
    {
      "id": "0",
      "name": "Полный",
      "events": [],
      "data": [{
        "title": "Дата начала"},{
        "title": "Дата окончания"},{
        "title": "Средняя скорость"}]
    }
  ];
  if ($scope.report.systemKey == "" && $route.current.params.skey) {
        $scope.report.systemKey = $route.current.params.skey;//$scope.account.account.skeys[0];
        $scope.showReportWindow();
      }
}]);


  function getXLSXDownloadLink (report) {

  var reportData =  []
  var reportDataPerDay =  []
  var headers =[];
     if (report.hasFuelSensor) {
        headers = [
          "Событие",
          "Координаты",
          "Период",
          "Изменение уровня топлива",
          "Уровень топлива",
          "Продолжительность",
          "Средняя скорость",
          "Пройдено"
        ];
     } else {
        headers = [
          "Событие",
          "Координаты",
          "Период",
          /*"Изменение уровня топлива",
          "Уровень топлива",*/
          "Продолжительность",
          "Средняя скорость",
          "Пройдено"
        ];
     }


  reportData.push(headers)
  reportDataPerDay.push(headers)

    // отчет по дням
      var days = report.reportData.days;
    for(var i = 0; i < days.length; ++i){
      if(days[i].events.length==0)continue;

    reportDataPerDay.push([{colSpan:8, value: days[i].strFormatted}])

    var rawData = days[i].events;
    for(var j = 0; j < rawData.length; ++j){
        var item;
        if (report.hasFuelSensor) {
            item = [
                      rawData[j].event,
                      rawData[j].address || rawData[j].position,
                      rawData[j].startdt+" - "+rawData[j].finishdt,
                      rawData[j].fuelChange,
                      rawData[j].fuel,
                      rawData[j].duration,
                      rawData[j].speed,
                      rawData[j].distance
                    ];

        } else {
            item = [
                      rawData[j].event,
                      rawData[j].address || rawData[j].position,
                      rawData[j].startdt+" - "+rawData[j].finishdt,
                      /*rawData[j].fuelChange,
                      rawData[j].fuel,*/
                      rawData[j].duration,
                      rawData[j].speed,
                      rawData[j].distance
                    ];

        }
        reportDataPerDay.push(item)
    }
    }
  // отчет общий
    var rawData = report.reportData.rows;
    for(var i = 0; i < rawData.length; ++i){
        var item;
        if (report.hasFuelSensor) {
            item = [
                      rawData[i].event,
                      rawData[i].address || rawData[i].position,
                      rawData[i].startdt+" - "+rawData[i].finishdt,
                      rawData[i].fuelChange,
                      rawData[i].fuel,
                      rawData[i].duration,
                      rawData[i].speed,
                      rawData[i].distance
                    ];

        } else {
            item = [
                      rawData[i].event,
                      rawData[i].address || rawData[i].position,
                      rawData[i].startdt+" - "+rawData[i].finishdt,
                      /*rawData[i].fuelChange,
                      rawData[i].fuel,*/
                      rawData[i].duration,
                      rawData[i].speed,
                      rawData[i].distance
                    ];

        }
      reportData.push(item);
    }

  var _data;
    if (report.hasFuelSensor) {
        _data = [[
                 "Контролируемые параметры ",
                   "Результат"
                 ],[
                 "Пройденная дистанция ",
                   report.reportData.summary.distance
                 ],[
                   "Общее время в пути ",
                   report.reportData.summary.moveDuration,
                 ],[
                   "Средняя скорость движения ",
                   report.reportData.summary.speed
                 ],[
                   "Общее время стоянок и остановок ",
                    report.reportData.summary.stopDuration
                 ],[
                   "Максимальная скорость ",
                   report.reportData.summary.maxspeed
                 ],[
              "Расход топлива",
                  report.reportData.summary.fuel
            ]]
    } else {
        _data = [[
                 "Контролируемые параметры ",
                   "Результат"
                 ],[
                 "Пройденная дистанция ",
                   report.reportData.summary.distance
                 ],[
                   "Общее время в пути ",
                   report.reportData.summary.moveDuration,
                 ],[
                   "Средняя скорость движения ",
                   report.reportData.summary.speed
                 ],[
                   "Общее время стоянок и остановок ",
                    report.reportData.summary.stopDuration
                 ],[
                   "Максимальная скорость ",
                   report.reportData.summary.maxspeed
                 ]]
    }
  var sheet = xlsx({
      worksheets: [{
        data: reportData,
        name: "Отчет"
      }, {
        data: reportDataPerDay,
        name: "Отчет по дням"
      },{
        data:_data,
        name: "Итог"
      }]
    });

  // data URI
  return sheet.href();
  };

// (function($){
//   $.fn.datepicker.dates['ru'] = {
//     days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
//     daysShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб", "Вск"],
//     daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
//     months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
//     monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
//     today: "Сегодня",
//     weekStart: 1
//   };
// }(jQuery));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
