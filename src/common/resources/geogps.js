(function(){

/* Константы */
var FSOURCE_UNKNOWN     = 0,
    FSOURCE_SUDDENSTOP  = 1,
    FSOURCE_STOPACC     = 2,
    FSOURCE_TIMESTOPACC = 3,
    FSOURCE_SLOW        = 4,
    FSOURCE_TIMEMOVE    = 5,
    FSOURCE_START       = 6,
    FSOURCE_TIMESTOP    = 7,
    FSOURCE_ANGLE       = 8,
    FSOURCE_DELTALAT    = 9,
    FSOURCE_DELTALONG   = 10,
    FSOURCE_DELTA       = 11,
    FSOURCE_DU          = 12,    // Фиксация по дельте изменения внешнего напряжения
    FSOURCE_UMAX        = 13,    // Фиксация по превышению внешнего напряжения установленного порога
    FSOURCE_SUDDENSTART = 14,    // Это признак возможных проблем с акселерометром
    FSOURCE_SUDDENPOS   = 15,    // Это признак возможных проблем с акселерометром
    FSOURCE_TIMEINIT    = 16;    // Фиксация точек при первоначальной запитке


angular.module('resources.geogps', [])

.factory('GeoGPS', ['SERVER', '$http', '$q', 'System', function (SERVER, $http, $q, System) {
    var GeoGPS = {},
        skey = null,    // Ключ системы с которой идет работа
        // path = null,
        days = {};      // Дни, в которые было движение

    // var days = {};

    var parse_onebin = function(packet){
        // 0xFF,                   # D0: Заголовок (должен быть == 0xFF)
        if(packet[0] !== 0xFF) return null;

        // 0xF4,                   # D1: Идентификатор пакета (должен быть == 0xF4)
        // 32,                     # D2: Длина пакета в байтах, включая HEADER, ID и LENGTH (32)
        if((packet[1] == 0xF4) && (packet[2] == 32)){
            // dt,                     # D3: Дата+время
            var dt = packet[3] + packet[4]*256 + packet[5]*256*256 + packet[6]*256*256*256;
            // latitude,               # D4: Широта 1/10000 минут
            var lat = (packet[7] + packet[8]*256 + packet[9]*256*256 + packet[10]*256*256*256) / 600000.0;
            // longitude,              # D5: Долгота 1/10000 минут
            var lon = (packet[11] + packet[12]*256 + packet[13]*256*256 + packet[14]*256*256*256) / 600000.0;
            // speed,                  # D6: Скорость 1/100 узла
            var speed = ((packet[15] + packet[16]*256) * 1.852) / 100;
            // int(round(course/2)),   # D7: Направление/2 = 0..179
            var course = packet[17]*2;
            // sats,                   # D8: Кол-во спутников 3..12
            var sats = packet[18];
            // vout,                   # D9: Напряжение внешнего питания 1/100 B
            var vout = (packet[19] + packet[20]*256) / 100;
            // vin,                    # D10: Напряжение внутреннего аккумулятора 1/100 B
            var vin = (packet[21] + packet[22]*256) / 100;
            // fsource,                # D11: Тип точки   Причина фиксации точки
            var fsource = packet[23];
            // 0,                      # D12: Флаги
            var flags = packet[24] + packet[25]*256;
            // 0,                      # D13: Резерв
            var reserve1 = packet[26] + packet[27]*256 + packet[28]*256*256 + packet[29]*256*256*256;
            // 0,                      # D14: Резерв
            var reserve2 = packet[30];
            // 0                       # D15: Локальная CRC (пока не используется)
            var lcrc = packet[31];

            if((Math.abs(lat) >= 90) || (Math.abs(lon) >= 180)) return null;

            return {
                "dt": dt,
                "lat": lat,
                "lon": lon,
                "speed": speed,
                "course": course,
                "sats": sats,
                "vout": vout,
                "vin": vin,
                "fsource": fsource,
                "flags": flags,
                "fuel": Math.floor(reserve1 / 2),
                "reserve2": reserve2,
                "lcrc": lcrc
            };
        } else if(packet[1] == 0xF5){
            // fsource,                # B: Тип точки   Причина фиксации точки
            var fsource = packet[2];
            // sats,                   # B: Кол-во спутников 3..12
            var sats = packet[3];
            // dt,                     # I: Дата+время
            var dt = packet[4] + packet[5]*256 + packet[6]*256*256 + packet[7]*256*256*256;
            // latitude,               # I: Широта 1/10000 минут
            var lat = (packet[8] + packet[9]*256 + packet[10]*256*256 + packet[11]*256*256*256) / 600000.0;
            // longitude,              # I: Долгота 1/10000 минут
            var lon = (packet[12] + packet[13]*256 + packet[14]*256*256 + packet[15]*256*256*256) / 600000.0;
            // speed,                  # H: Скорость 1/100 узла
            var speed = ((packet[16] + packet[17]*256) * 1.852) / 100;
            // altitude,               # H: Высота над уровнем моря (м)
            var altitude = packet[18] + packet[19]*256;
            if(packet[19] > 127) altitude = altitude - 65536;
            // int(round(course/2)),   # B: Направление/2 = 0..179
            var course = packet[20] * 2;
            // vout,                   # B: Напряжение внешнего питания 1/100 B
            var vout = packet[21] * 4;
            // vin,                    # B: Напряжение внутреннего аккумулятора 1/100 B
            var vin = packet[22] * 4;
            // adc1,                   # B: АЦП1 - температура
            var adc1 = packet[23] * 4;
            // adc2,                   # B: АЦП2 - уровень топлива
            var adc2 = packet[24] * 4;
            // 0,                      # B: Младшие биты полей: vout, vin, adc1, adc2
            var lsbs = packet[25];
            vout += lsbs & 3;
            vin += (lsbs >> 2) & 3;
            adc1 += (lsbs >> 4) & 3;
            adc2 += (lsbs >> 6) & 3;
            // 5 байт резерв           # B: Флаги
            packet[26]; packet[27]; packet[28]; packet[29]; packet[30];
            // 0                       # D15: Локальная CRC (пока не используется)
            var lcrc = packet[31];

            if((Math.abs(lat) >= 90) || (Math.abs(lon) >= 180)) return null;

            return {
                "dt": dt,
                "lat": lat,
                "lon": lon,
                "speed": speed,
                "course": course,
                "sats": sats,
                "vout": vout / 10.0,
                "vin": vin / 100.0,
                "fsource": fsource,
                //"flags": flags,
                "fuel": adc2,
                "lcrc": lcrc
            };
        } else {
            console.warn("Unsupported packet type", packet[1]);
            return null;
        }
    };

    // Возвращает true если точка относится к стоянке
    var isStop = function(fsource){
        return $.inArray(fsource, [FSOURCE_STOPACC, FSOURCE_TIMESTOPACC, FSOURCE_TIMESTOP, FSOURCE_SLOW]) >= 0;
    }
    GeoGPS.isStop = isStop;

    var bingpsparse = function(array){
        // console.log('parse');
        var track = [];
        var points = [];
        var events = [];    // События на треке: Старт, стоп, стоянки (момент), остановки (момент), заправки и т.д.
        var ranges = [];    // Интервалы: Движение, стоянка, остановка
        var bounds = null;
        var min_hour = 1e15;
        var max_hour = 0;
        var hours = {};
        var range_start;
        var stop_start = null;  // Точка начала стоянки/остановки
        var move_start = null;  // Точка начала движения

        var index = 0;
        for(var i=0; i<array.length; i+=32){
            point = parse_onebin(array.subarray(i, i+32));
            // console.log('point=', point);
            // if(i===0){
            //     console.log('1st=', array.subarray(i, i+32));
            // }
            if(point){
                var gpoint = new google.maps.LatLng(point.lat, point.lon);
                points.push(point);
                if(bounds === null){
                    bounds = new google.maps.LatLngBounds(gpoint, gpoint);
                } else {
                    bounds.extend(gpoint);
                }

                var hour = ~~(point.dt / 60);
                if(hour < min_hour) min_hour = hour;
                if(hour > max_hour) max_hour = hour;
                hours[hour] = (hours[hour] || 0) + 1;

                if(events.length === 0){  // Первая точка
                    // console.log('1st', point);
                    events.push({
                        point: point,
                        position: gpoint,
                        type: 'START',
                        index: index
                    });
                    range_start = point;

                    // if($.inArray(point['fsource'], [FSOURCE_STOPACC, FSOURCE_TIMESTOPACC, FSOURCE_TIMESTOP, FSOURCE_SLOW]) >= 0){
                    if(isStop(point['fsource'])){
                        stop_start = 0;
                        events.push({
                            point: point,
                            position: gpoint,
                            type: 'STOP',   // Стоянка/остановка (тит пока не определен)
                            index: index
                        });
                    } else {
                        move_start = 0;
                    }
                }
                // if(point['fsource'] in [FSOURCE_STOPACC, FSOURCE_TIMESTOPACC, FSOURCE_TIMESTOP, FSOURCE_SLOW]){
                // if($.inArray(point['fsource'], [FSOURCE_STOPACC, FSOURCE_TIMESTOPACC, FSOURCE_TIMESTOP, FSOURCE_SLOW]) >= 0){
                if(isStop(point['fsource'])){
                    if(stop_start === null){
                        stop_start = index;
                        events.push({
                            point: point,
                            position: gpoint,
                            type: 'STOP',   // Стоянка/остановка (тит пока не определен)
                            index: index
                        });
                    } else {
                        gpoint = new google.maps.LatLng(points[stop_start].lat, points[stop_start].lon);
                    }
                    if(move_start !== null){
                        ranges.push({
                            type: 'MOVE',           // Движение
                            start_index: move_start,
                            start: points[move_start],
                            stop_index: index,
                            stop: points[index]
                        });
                        move_start = null;
                    }
                } else /*if(point['fsource'] === FSOURCE_START)*/{
                    if(stop_start !== null){
                        var lastevent = events[events.length-1];
                        lastevent.end = point;
                        if(lastevent.type === 'STOP'){
                            var system = System.cached(skey);
                            var treshold = 5;
                            if(system && system.car && system.car.stop){
                                treshold = system.car.stop | 0;
                            }
                            var duration = lastevent.end.dt - lastevent.point.dt;
                            if(duration < treshold * 60) {
                                lastevent.type = 'HOLD';
                            }
                        }
                        ranges.push({
                            type: 'STOP',           // Стоянка/остановка (тит пока не определен)
                            start_index: stop_start,
                            start: points[stop_start],
                            stop_index: index,
                            stop: points[index]
                        });
                        stop_start = null;
                    }
                    if(move_start === null){
                        move_start = index;
                    }
                }/* else {
                    stop_start = null;
                    if(!move_start){
                        move_start = index;
                    }
                }*/
                track.push(gpoint);

                index += 1;
            }
        }

        if(index > 0){
            events.push({
                point: points[index-1],
                position: track[index-1],
                type: 'FINISH',
                index: index-1
            });
            if(stop_start !== null) {
                ranges.push({
                    type: 'STOP',           // Стоянка/остановка (тит пока не определен)
                    start_index: stop_start,
                    start: points[stop_start],
                    stop_index: index-1,
                    stop: points[index-1]
                });
            } else if(move_start !== null){
                ranges.push({
                    type: 'MOVE',           // Движение
                    start_index: move_start,
                    start: points[move_start],
                    stop_index: index-1,
                    stop: points[index-1]
                });
            }
        }

        // for(var i = 0; i < ranges.length; i++){
        //     var r = ranges[i];
        //     r.start = points[r.start_index];
        //     r.stop = points[r.stop_index];
        // }

        return {
            track: track,
            bounds: bounds,
            points: points,
            min_hour: min_hour,
            max_hour: max_hour,
            hours: hours,
            events: events,
            ranges: ranges
        };
    };

    GeoGPS.select = function(newskey){
        skey = newskey;
    };

    GeoGPS.getHours = function(hourfrom, hourto){
        var defer = $q.defer();
        // console.log(['GeoGPS.getHours', skey, hourfrom, hourto, defer]);
        $http({
            method: 'GET',
            cache: false,
            withCredentials: SERVER.api_withCredentials,
            url: SERVER.api + "/geos/" + encodeURIComponent(skey) + "/hours",
            params: {
                from: hourfrom,
                to: hourto,
                rand: (Math.random()*1e18)|0
            }
        }).success(function(data){
            // console.log('hours data=', data);
            days = {};
            if(!data || (data.hours.length === 0)){
                // callback([]);
                // defer.reject();
            } else {
                // callback(data.hours);
                for(var i=0, l=data.hours.length; i<l; i++){
                    var hour = data.hours[i];
                    var date = new Date(hour * 3600 * 1000);
                    date.setHours(0); date.setMinutes(0); date.setSeconds(0); date.setMilliseconds(0);
                    //var dayhour = date.getTime()/1000/3600; // Первый час суток
                    var dateepoch = (new Date(date.toDateString() + " GMT")) / 1000 / 3600 / 24;
                    if(dateepoch in days){
                        days[dateepoch] += 1;
                        // console.log("set", days);
                    } else {
                        days[dateepoch] = 1;
                        // console.log("grow", days);
                    }
                    // console.log("hour", hour, "->", date.toDateString(), dayhour, dateepoch);
                }
            }
            defer.resolve();
        });
        return defer.promise;
    };

    GeoGPS.checkDay = function(day){
        return day in days;
    };

    GeoGPS.getTrack = function(hourfrom, hourto){
        var defer = $q.defer();
        // console.log("getTrack", skey, hourfrom, hourto);

        // GeoGPS.hideTrack();
        $http({
            method: 'GET',
            cache: false,
            withCredentials: SERVER.api_withCredentials,
            headers: {"Accept": "application/octet-stream"},
            responseType: 'arraybuffer',
            url: SERVER.api + "/geos/" + encodeURIComponent(skey),
            params: {
                from: hourfrom,
                to: hourto
            }
        }).success(function(data){
            // console.log('GeoGPS.getTrack.success', data);
            if(!data) {
                defer.resolve({
                    track: [],
                    bounds: null,
                    points: [],
                    min_hour: null,
                    max_hour: null,
                    hours: null,
                    events: [],
                    ranges: []
                });
                return;
            }
            var uInt8Array = new Uint8Array(data);
            // var parsed = bingpsparse(uInt8Array);
            // console.log('parsed=', parsed);
            // parsed.constants = parsed.constants || {skey: skey};
            defer.resolve(bingpsparse(uInt8Array));
        }).error(function(data, status) {
            console.log('GeoGPS.getTrack.error', data, status);
        });
        return defer.promise;
    };

    // GeoGPS.hideTrack = function(){
    //     if(path) {
    //         path.setMap(null);
    //         path = null;
    //     }
    // };

    return GeoGPS;
}]);

})();
