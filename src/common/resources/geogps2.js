/* global angular:true, window:true */

// В оригинальном GeoGPS не учтена возможность изолированной работы с трекерами.
// Что в частности не дает возможности загружать данные одновременно по нескольким трекерам.
// Кроме того, оригинальный GeoGPS переполнен функциями и утратил прозрачность работы.

;(function() {

'use strict';


angular.module('resources.geogps2', [])

.factory('GeoGPS2', ['SERVER', '$http', '$q', function(SERVER, $http, $q) {

    var GeoGPS2 = {};

    // Экземпляр объекта, который обслуживает трекер
    // Замена GeoGPS.select(skey);

    var GeoGPSModel = function(skey){
        this.skey = skey;
        //this.system = System.cached(newskey); // Тут есть потенциальная опасность если данные на момент выбора еще не готовы
        this.days = {};
    };

    GeoGPSModel.prototype.getHours = function(hourfrom, hourto) {
        var that = this;

        var defer = $q.defer();
        window.console.log('GeoGPS2.getHours', that.skey, hourfrom, hourto);

        $http({
            method: 'GET',
            cache: false,
            withCredentials: SERVER.api_withCredentials,
            url: SERVER.api + '/geos/' + encodeURIComponent(that.skey) + '/hours',
            params: {
                from: hourfrom,
                to: hourto,
                rand: (Math.random() * 1e18) | 0
            }
        }).success(function(data) {
            // console.log('hours data=', data);
            that.days = {};
            if (!data || (data.hours.length === 0)) {
                // error callback?
                that.hours = [];
                defer.reject(that);
            } else {
                that.hours = data.hours;
                for (var i = 0, l = data.hours.length; i < l; i++) {
                    var hour = data.hours[i];
                    var date = new Date(hour * 3600 * 1000);
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    date.setMilliseconds(0);
                    //var dayhour = date.getTime()/1000/3600; // Первый час суток
                    var dateepoch = (new Date(date.toDateString() + ' GMT')) / 1000 / 3600 / 24;
                    if (dateepoch in that.days) {
                        that.days[dateepoch] += 1;
                        // console.log('set', days);
                    } else {
                        that.days[dateepoch] = 1;
                        // console.log('grow', days);
                    }
                    // console.log('hour', hour, '->', date.toDateString(), dayhour, dateepoch);
                }
            }
            defer.resolve(that);
        });
        return defer.promise;
    };

    GeoGPSModel.prototype.del = function(hourfrom, hourto) {
        var that = this;

        var defer = $q.defer();
        window.console.log('GeoGPS2.delete', that.skey, hourfrom, hourto);

        $http({
            method: 'DELETE',
            cache: false,
            withCredentials: SERVER.api_withCredentials,
            url: SERVER.api + '/geos/' + encodeURIComponent(that.skey),
            params: {
                from: hourfrom,
                to: hourto
            }
        }).success(function(data) {
            defer.resolve(that);
        }).error(function(data){
            defer.reject(data);
        });
        return defer.promise;
    };

    GeoGPS2.model = function(skey) {
        return new GeoGPSModel(skey);
    };

    // Сокращенная форма использования. Если нет необходимости сохранять состояние между вызовами.
    GeoGPS2.getHours = function(skey, hourfrom, hourto) {
        var geoGPSmodel = new GeoGPSModel(skey);
        return geoGPSmodel.getHours(hourfrom, hourto);
    };

    GeoGPS2.del = function(skey, hourfrom, hourto) {
        var geoGPSmodel = new GeoGPSModel(skey);
        return geoGPSmodel.del(hourfrom, hourto);
    };

    return GeoGPS2;
}]);

})();
