/* global angular:true, window:true, $:true, google:true, d3:true */

(function() {

'use strict';

/* Константы */
var FSOURCE = {
    UNKNOWN:        0,
    SUDDENSTOP:     1,
    STOPACC:        2,
    TIMESTOPACC:    3,
    SLOW:           4,
    TIMEMOVE:       5,
    START:          6,
    TIMESTOP:       7,
    ANGLE:          8,
    DELTALAT:       9,
    DELTALONG:      10,
    DELTA:          11,
    DU:             12, // Фиксация по дельте изменения внешнего напряжения
    UMAX:           13, // Фиксация по превышению внешнего напряжения установленного порога
    SUDDENSTART:    14, // Это признак возможных проблем с акселерометром
    SUDDENPOS:      15, // Это признак возможных проблем с акселерометром
    TIMEINIT:       16  // Фиксация точек при первоначальной запитке
};
var POINTTYPE = {
    UNKNOWN:        0,
    MOVE:           1,
    STOP:           2
};

angular.module('resources.geogps', [])

.factory('GeoGPS', ['SERVER', '$http', '$q', 'System',
    function(SERVER, $http, $q, System) {
        var GeoGPS = {},
            skey = null, // Ключ системы с которой идет работа
            system = null,
            options = {
                raw: false,
                useServerFiltration: true,
                filter_shortTraveled: true,
                filter_invalidPoints: true,
                filter_ejection: true,
                filter_clearStopPoints: true,
                addPoint_23_59: true,
                addPoint_00_00: true,
                stopDistance: 1,
                stopTime: 3,
                minMoveDistance: 0.05,
                minMoveTime: 8,
                interval_0: 60,
                interval_1: 120,
                interval_2: 180,
                motorOn_min: 13.1,
                motorOn_min_2: 26.2,
                motorOn_max: 19,
                stopMovingMinDistance: 0.01,
                stopMovingMinDistance_2: 0.02,
                moving_speed_with_out_accelerometer: 60,
                moving_a_distance_with_out_accelerometer: 5,
                moving_speed_with_accelerometer: 10,
                moving_a_distance_with_accelerometer: 0.05,
                moving_speed_with_motor_on: 5,
                moving_a_distance_with_motor_on: 0.03,
                correctFromHours: 120,
                minSputniksCount: 4, //если меньше то удалить точку
                ejectionDistance: 0.5,
                ejectionTime: 1200,
                ejectionMultiplier: 3,
                updateValues: function (sys) {
                    if (system && system.car) {
                        for(var key in this) {
                            if (key in sys.car)
                                if (sys.car [key] !== '') {
                                    if (sys.car [key] == 'true')
                                        this [key] = true;
                                    else if (sys.car [key] == 'false') {
                                        this [key] = false;
                                    } else if (typeof(sys.car [key]) == 'string') {
                                        //console.log("value is string! key : ", key, " Value : ", sys.car [key]);
                                        this [key] = parseFloat(sys.car [key].replace(",", "."));
                                    } else {
                                        this [key] = sys.car [key];
                                    }
                                }
                        }
                        console.log ("updateValues-------> options : ", options);
                    }
                }
            },
            // path = null,
            days = {}; // Дни, в которые было движение
        GeoGPS.options = options;
        // var days = {};
        var loadOptions = function () {
            options.raw = window.localStorage.getItem('lacalRaw') == 'true' ? true : false;
        };
        loadOptions ();

        var parse_onebin = function(packet) {
            var fsource, dt, lat, lon, speed, course, sats, vout, vin, flags, reserve1, reserve2, lcrc, adc1, adc2, lsbs, altitude;
            // 0xFF,                   # D0: Заголовок (должен быть == 0xFF)
            if (packet[0] !== 0xFF) return null;

            // 0xF4,                   # D1: Идентификатор пакета (должен быть == 0xF4)
            // 32,                     # D2: Длина пакета в байтах, включая HEADER, ID и LENGTH (32)
            if ((packet[1] == 0xF4) && (packet[2] == 32)) {
                // dt,                     # D3: Дата+время
                dt = packet[3] + packet[4] * 256 + packet[5] * 256 * 256 + packet[6] * 256 * 256 * 256;
                // latitude,               # D4: Широта 1/10000 минут
                lat = (packet[7] + packet[8] * 256 + packet[9] * 256 * 256 + packet[10] * 256 * 256 * 256) / 600000.0;
                // longitude,              # D5: Долгота 1/10000 минут
                lon = (packet[11] + packet[12] * 256 + packet[13] * 256 * 256 + packet[14] * 256 * 256 * 256) / 600000.0;
                // speed,                  # D6: Скорость 1/100 узла
                speed = ((packet[15] + packet[16] * 256) * 1.852) / 100;
                // int(round(course/2)),   # D7: Направление/2 = 0..179
                course = packet[17] * 2;
                // sats,                   # D8: Кол-во спутников 3..12
                sats = packet[18];
                // vout,                   # D9: Напряжение внешнего питания 1/100 B
                vout = (packet[19] + packet[20] * 256) / 100;
                // vin,                    # D10: Напряжение внутреннего аккумулятора 1/100 B
                vin = (packet[21] + packet[22] * 256) / 100;
                // fsource,                # D11: Тип точки   Причина фиксации точки
                fsource = packet[23];
                // 0,                      # D12: Флаги
                flags = packet[24] + packet[25] * 256;
                // 0,                      # D13: Резерв
                reserve1 = packet[26] + packet[27] * 256 + packet[28] * 256 * 256 + packet[29] * 256 * 256 * 256;
                // 0,                      # D14: Резерв
                reserve2 = packet[30];
                // 0                       # D15: Локальная CRC (пока не используется)
                lcrc = packet[31];

                if ((Math.abs(lat) >= 90) || (Math.abs(lon) >= 180)) return null;

                return {
                    'dt': dt,
                    'lat': lat,
                    'lon': lon,
                    'speed': speed,
                    'course': course,
                    'sats': sats,
                    'vout': vout,
                    'vin': vin,
                    'fsource': fsource,
                    'flags': flags,
                    'fuel': Math.floor(reserve1 / 2),
                    'reserve2': reserve2,
                    'lcrc': lcrc
                };
            } else if (packet[1] == 0xF5) {
                // fsource,                # B: Тип точки   Причина фиксации точки
                fsource = packet[2];
                // sats,                   # B: Кол-во спутников 3..12
                sats = packet[3];
                // dt,                     # I: Дата+время
                dt = packet[4] + packet[5] * 256 + packet[6] * 256 * 256 + packet[7] * 256 * 256 * 256;
                // latitude,               # I: Широта 1/10000 минут
                lat = (packet[8] + packet[9] * 256 + packet[10] * 256 * 256 + packet[11] * 256 * 256 * 256) / 600000.0;
                // longitude,              # I: Долгота 1/10000 минут
                lon = (packet[12] + packet[13] * 256 + packet[14] * 256 * 256 + packet[15] * 256 * 256 * 256) / 600000.0;
                // speed,                  # H: Скорость 1/100 узла
                speed = ((packet[16] + packet[17] * 256) * 1.852) / 100;
                // altitude,               # H: Высота над уровнем моря (м)
                altitude = packet[18] + packet[19] * 256;
                if (packet[19] > 127) altitude = altitude - 65536;
                // int(round(course/2)),   # B: Направление/2 = 0..179
                course = packet[20] * 2;
                // vout,                   # B: Напряжение внешнего питания 1/100 B
                vout = packet[21] * 4;
                // vin,                    # B: Напряжение внутреннего аккумулятора 1/100 B
                vin = packet[22] * 4;
                // adc1,                   # B: АЦП1 - температура
                adc1 = packet[23] * 4;
                // adc2,                   # B: АЦП2 - уровень топлива
                adc2 = packet[24] * 4;
                // 0,                      # B: Младшие биты полей: vout, vin, adc1, adc2
                lsbs = packet[25];
                vout += lsbs & 3;
                vin += (lsbs >> 2) & 3;
                adc1 += (lsbs >> 4) & 3;
                adc2 += (lsbs >> 6) & 3;
                // 5 байт резерв           # B: Флаги
                // packet[26];
                // packet[27];
                // packet[28];
                // packet[29];
                // packet[30];
                // 0                       # D15: Локальная CRC (пока не используется)
                lcrc = packet[31];

                if ((Math.abs(lat) >= 90) || (Math.abs(lon) >= 180)) return null;

                return {
                    'dt': dt,
                    'lat': lat,
                    'lon': lon,
                    'speed': speed,
                    'course': course,
                    'sats': sats,
                    'vout': vout / 10.0,
                    'vin': vin / 100.0,
                    'fsource': fsource,
                    //'flags': flags,
                    'fuel': adc2,
                    'lcrc': lcrc
                };
            } else {
                window.console.warn('Unsupported packet type', packet[1]);
                return null;
            }
        };

        // Возвращает true если точка относится к стоянке
        var isStop = function(point) {
            if (options.useServerFiltration && !options.raw) {
                return point.type === POINTTYPE.STOP;
            } else {
                return $.inArray(point.fsource, [FSOURCE.STOPACC, FSOURCE.TIMESTOPACC, FSOURCE.TIMESTOP, FSOURCE.SLOW]) >= 0;
            }
        };
        var isStop_2 = function(point) {
            return point.type === POINTTYPE.STOP;
        };
        GeoGPS.isStop = isStop;

        var isStop_fsource = function(fsource) {
            return $.inArray(fsource, [FSOURCE.STOPACC, FSOURCE.TIMESTOPACC, FSOURCE.TIMESTOP, FSOURCE.SLOW]) >= 0;
        };
        GeoGPS.isStop_fsource = isStop_fsource;

////////////////////////////////////////////////////////////////////
        GeoGPS.getPointsFromPoints = function (points, startIndex, stopIndex) {
            var ret_points = [];
            if (points) {
                if (!startIndex)
                    startIndex = 0;
                if (!stopIndex)
                    stopIndex = points.length;
                for (var i = startIndex; i < stopIndex; i++) {
                    ret_points.push (points [i]);
                }
            }
            return ret_points;
        };

        GeoGPS.getTrackFromPoints = function (points, startIndex, stopIndex) {
            var track = [];
            if (points) {
                if (!startIndex)
                    startIndex = 0;
                if (!stopIndex)
                    stopIndex = points.length;
                for (var i = startIndex; i < stopIndex; i++) {
                    //if (!isStop (points [i]))
                        track.push (new google.maps.LatLng (points [i].lat, points [i].lon));
                }
            }
            return track;
        };

        GeoGPS.getBoundsFromPoints = function (points, startIndex, stopIndex) {
            var bounds = null;
            if (points) {
                if (!startIndex)
                    startIndex = 0;
                if (!stopIndex)
                    stopIndex = points.length;
                for (var i = startIndex; i < stopIndex; i++) {
                    var gpoint = new google.maps.LatLng (points [i].lat, points [i].lon);
                    if (bounds === null) {
                        bounds = new google.maps.LatLngBounds (gpoint, gpoint);
                    } else {
                        bounds.extend (gpoint);
                    }
                }
            }
            return bounds;
        };

        GeoGPS.getRangesFromPoints = function (points, startIndex, stopIndex) {
            var ranges = [];
            if (points) {
                if (!startIndex)
                    startIndex = 0;
                if (!stopIndex)
                    stopIndex = points.length;
                var stop_start = null;
                var move_start = null;
                var i = startIndex;
                for (; i < stopIndex; i++) {
                    var point = points [i];
                    if (isStop (point)) {
                        if (stop_start === null) {
                            stop_start = i;
                        }
                        if (move_start !== null) {
                            ranges.push({
                                type: 'MOVE', // Движение
                                start_index: move_start,
                                start: points [move_start],
                                stop_index: i,
                                stop: points [i]
                            });
                            move_start = null;
                        }
                    } else {
                        if (move_start === null) {
                            move_start = i;
                        }
                        if (stop_start !== null) {
                            ranges.push({
                                type: 'STOP', // Остановка
                                start_index: stop_start,
                                start: points [stop_start],
                                stop_index: i,
                                stop: points [i]
                            });
                            stop_start = null;
                        }
                    }
                }
                if (stop_start !== null) {
                    ranges.push({
                        type: 'STOP', // Остановка
                        start_index: stop_start,
                        start: points [stop_start],
                        stop_index: i - 1,
                        stop: points [i - 1]
                    });
                    stop_start = null;
                }
                if (move_start !== null) {
                    ranges.push({
                        type: 'MOVE', // Движение
                        start_index: move_start,
                        start: points [move_start],
                        stop_index: i - 1,
                        stop: points [i - 1]
                    });
                    move_start = null;
                }
            }
            return ranges;
        };


        GeoGPS.getEventsFromPoints = function (points, startIndex, stopIndex, system) {
            var events = [];
            if (points) {
                if (!startIndex)
                    startIndex = 0;
                if (!stopIndex)
                    stopIndex = points.length;
                var gpoint;
                var point = null;
                var stop_start = null;
                var stopTime = GeoGPS.options.stopTime * 60;
                for (var i = startIndex; i < stopIndex; i++) {
                    point = points [i];
                    if (events.length === 0) { // Первая точка
                        events.push({
                            point: point,
                            position: new google.maps.LatLng(point.lat, point.lon),
                            type: 'START',
                            index: i
                        });
                    }
                    if (isStop(point)) {
                        if (stop_start === null) {
                            stop_start = i;
                            events.push({
                                point: point,
                                position: new google.maps.LatLng(points[stop_start].lat, points[stop_start].lon),
                                type: 'STOP', // Стоянка/остановка (тит пока не определен)
                                index: i
                            });
                        }
                    } else {
                        if (stop_start !== null) {
                            var lastevent = events [events.length - 1];
                            lastevent.end = point;
                            if (lastevent.type === 'STOP') {
                                var duration = lastevent.end.dt - lastevent.point.dt;
                                if (duration < stopTime) {
                                    lastevent.type = 'HOLD';
                                }
                            }
                        }
                        stop_start = null;
                    }
                }
                if (events.length > 0) {

                    events.push({
                        point: point,
                        position: new google.maps.LatLng(point.lat, point.lon),
                        type: 'FINISH',
                        index: stopIndex - 1
                    });
                }
            }
            return events;
        };

        var clearStopPointsCoordinates = function (points) {
            var stop_start = null;
            for (var i = 0; i < points.length; i++) {
                var point = points [i];
                if (isStop  (point)) {
                    if (stop_start === null) {
                        stop_start = i;
                    } else {
                        if (distance (points [stop_start], point) < GeoGPS.options.stopDistance || i === points.length - 1) {
                            copyPointParams (points [stop_start], point);
                        } else {
                            if (distance (points [i + 1], point) < GeoGPS.options.stopDistance) {
                                stop_start = i;
                            } else {
                                copyPointParams (points [stop_start], point);
                            }
                        }
                    }
                } else {
                    stop_start = null;
                }
            }
        };
        var transferStopPoint = function (points, hoursFrom) {
            var i = 0;
            var stopPoint = null;
            for (; i < points.length; i++) {
                    var hour = ~~ (points [i].dt / 3600);
                    if (hour >= hoursFrom + GeoGPS.options.correctFromHours) {
                        if (stopPoint !== null) {
                            if (distance (stopPoint, points [i]) < GeoGPS.options.stopDistance) {
                                copyPointParams (stopPoint, points [i]);
                            }
                            if (GeoGPS.options.addPoint_00_00) {
                                points [i].dt = hour * 3600;
                            }
                        }
                        break;
                    } else {
                        if (isStop (points [i])) {
                             if (stopPoint === null) {
                                 stopPoint = points [i];
                             }
                        } else {
                            stopPoint = null;
                        }
                    }
            }
            return GeoGPS.getPointsFromPoints (points, i, points.length);
        };

        var removeInvalidPoints = function (points) {
            var points_ret = [];
            var i = 0;
            var prevPoint = null;
            for (; i < points.length; i++) {
                var point = points [i];
                if (point.lat === 0 && point.lon === 0) {
                    //console.log ("Точка с координатами 0,0");
                    continue;
                }
                if (!point.sats || point.sats < GeoGPS.options.minSputniksCount) {
                    //console.log("Маленькое количество спутников : ", point.sats);
                    continue;
                }
                if (prevPoint !== null && point.dt - prevPoint.dt < 0) {
                    //console.log("Нарушение хронологии");
                    continue;
                }
                    prevPoint = point;
                points_ret.push (point);
            }
            return points_ret;
        };

        var updatePointsFuel = function (points) {
            var fuelscale = System.$fuelscale(skey);
            for (var i = 0; i < points.length; i++) {
             if(points [i] !== null && points [i].fuel) {
                    points [i].fuel = fuelscale (points [i].fuel);
                }
            }
        };

        var removeLargeMoveInShortTime = function (points) {
            if (!points || points.length === 0)
                return [];
            var points_ret = [];
            var ejection = null;
            var ejectionDistance = GeoGPS.options.ejectionDistance;
            var ejectionTime = GeoGPS.options.ejectionTime;
            var ejectionMultiplier = 3;

            points_ret.push (points [0]);
            for (var i = 0; i < points.length - 1; i++) {
                if (ejection !== null) {
                    if (distance (ejection, points [i + 1]) < ejectionDistance)  {
                        continue;
                    } else {
                        ejection = null;
                    }
                } else {
                    var time = points [i + 1].dt - points [i].dt;
                    var maxMovedDistance = (points [i].speed + points [i + 1].speed) * ejectionMultiplier * (time / 3600);
                    var dist = distance (points [i], points [i + 1]);
                    //if (distance (points [i], points [i + 1]) > ejectionDistance && ((points [i + 1].dt - points [i].dt) < ejectionTime)) {
                    if (dist > maxMovedDistance && time < ejectionTime && dist > ejectionDistance) {
                        ejection = points [i + 1];
                        continue;
                    }
                }
                points_ret.push (points [i + 1]);
            }
            return points_ret;
        };
        
        var removeShortTrips = function (points) {
            var minTripTime = GeoGPS.options.minMoveTime;
            var minTripDistance = GeoGPS.options.minMoveDistance;
            var points_ret = [];
            var move_start = null;
            var lastInsertPointIndex = 0;
            var moveDistance = 0;
            var i = 0;
            var insertPoints = function (pointIndex) {
                for (var j = lastInsertPointIndex; j < pointIndex; j++) {
                    points_ret.push (points [j]);
                }
                lastInsertPointIndex = pointIndex;
            };
            for (; i < points.length; i++) {
                var point = points [i];
                if (!isStop (point)) {
                    if (move_start === null) {
                        insertPoints (i);
                        move_start = i;
                        moveDistance = 0;
                    }
                } else {
                    if (move_start !== null) {
                        for (var k = move_start; k < i; k++) {
                            moveDistance += distance (points [k], points [k + 1]);
                        }
                        if (minTripTime < (point.dt - points [move_start].dt) &&
                            minTripDistance < moveDistance) {
                            insertPoints (i);
                        } else {
                            lastInsertPointIndex = i;
                            var prevPoint = points_ret [points_ret.length - 1] || points [i];
                            var newPoint = angular.copy (points [i]);
                            //copyPointParams (prevPoint, newPoint);
                            newPoint.dt =  points [i].dt;
                            points_ret.push (newPoint);
                            //points_ret.push (point);
                        }
                        move_start = null;
                    }
                }
            }
            if (lastInsertPointIndex < points.length) {
                insertPoints (points.length);
            }
            return points_ret;
        };

        GeoGPS.getHoursFromPoints = function (points, startIndex, stopIndex) {
            var hours = {};
            var min_hour = 1e15;
            var max_hour = 0;
            if (points) {
                if (!startIndex)
                    startIndex = 0;
                if (!stopIndex)
                    stopIndex = points.length;
                for (var i = startIndex; i < stopIndex; i++) {
                    var hour = ~~ (points [i].dt / 3600);
                    if (hour < min_hour) min_hour = hour;
                    if (hour > max_hour) max_hour = hour;
                    hours[hour] = (hours[hour] || 0) + 1;
                }
            }
            hours.min = min_hour;
            hours.max = max_hour;
            return hours;
        };

        var isMotorOn = function (point) {
            return (point.vout > GeoGPS.options.motorOn_min && point.vout < GeoGPS.options.motorOn_max) || (point.vout > GeoGPS.options.motorOn_min_2);
        };

        var isAccelerometerOn = function (point) {
            return $.inArray (point.fsource, [FSOURCE.SUDDENSTOP, FSOURCE.STOPACC, FSOURCE.TIMESTOPACC]) == -1;
        };

        var isStartMoving = function (points, index) {
            var point = points [index];
            var prevPoint = points [index - 1] || null;
            var accelerometerOn = isAccelerometerOn (point);
            var motorOn = isMotorOn (point);
                
            var condition_1 = !accelerometerOn && point.speed > GeoGPS.options.moving_speed_with_out_accelerometer; //Перемещение со скоростью более 60 км/час (программируется) без срабатывания акселерометра
            if (condition_1) {
                //console.log ("condition_1");
                //console.log("point : ", point, " Date : ", new Date (point.dt * 1000));
                return true;
            }
            var condition_2 = !accelerometerOn && prevPoint && distance (prevPoint, point) > GeoGPS.options.moving_a_distance_with_out_accelerometer;  //Перемещение на расстояние более чем на 5000 метров (программируется) без срабатывания акселерометра
            if (condition_2) {
                //console.log ("condition_2");
                //console.log("point : ", point, " Date : ", new Date (point.dt * 1000));
                //console.log("distance : ",distance (prevPoint, point)); 
                return true;
            }
            var condition_3 = accelerometerOn && point.speed >  GeoGPS.options.moving_speed_with_accelerometer; //Срабатывание акселерометра и перемещение со скоростью более 10 км/час (программируется).
            if (condition_3) {
                //console.log ("condition_3");
                //console.log("point : ", point, " Date : ", new Date (point.dt * 1000));
                return true;
            }
            var condition_4 = accelerometerOn && prevPoint && distance (prevPoint, point) > GeoGPS.options.moving_a_distance_with_accelerometer;  // Срабатывание акселерометра и перемещение на расстояние более 50 метров (программируется)
            if (condition_4) {
                //console.log ("condition_4");
                //console.log("point : ", point, " Date : ", new Date (point.dt * 1000));
                return true;
            }
            var condition_5 = motorOn && point.speed > GeoGPS.options.moving_speed_with_motor_on;  //Повышение напряжения бортового питания выше 13,5V (27,0V) и перемещение со скоростью более 5 км/час (программируется)
            if (condition_5) {
                //console.log ("condition_5");
                //console.log("point : ", point, " Date : ", new Date (point.dt * 1000));
                return true;
            }
            var condition_6 = motorOn && prevPoint && distance (prevPoint, point) > GeoGPS.options.moving_a_distance_with_motor_on;  //Повышение напряжения бортового питания выше 13,5V (27,0V) и перемещение на расстояние более 30 метров (программируется)
            if (condition_6) {
                //console.log ("condition_6");
                //console.log("point : ", point, " Date : ", new Date (point.dt * 1000));
                return true;
            }
            //console.log ("condition_false");
            return false;
            //return condition_1 || condition_2 || condition_3 || condition_4 || condition_5 || condition_6;
        };

        var isSlowingPoint = function (point) {
            //return  point.fsource == FSOURCE.SUDDENSTOP;
            //return $.inArray (point.fsource, [FSOURCE.SUDDENSTOP, FSOURCE.STOPACC, FSOURCE.TIMESTOPACC]) == -1;
            return point.speed < 1;
        };

        var isStopMoving = function (slowingPoint, interval_0, interval_1, interval_2) {
            var i = 0;
            var minDistance = GeoGPS.options.stopMovingMinDistance;
            var minDistance_2 = GeoGPS.options.stopMovingMinDistance_2;

            //Если в течение 60 сек (программируется) после отправки точки замедления акселерометр не фиксирует сработок - трекер фиксирует точку замедления, как точку стоянки
            var condition_1 = true;
            for (;i < interval_0.length; i++) {
                if (isAccelerometerOn (interval_0 [i])) {
                    condition_1 = false;
                    break;
                }
            }
            if (condition_1)
                return true;
            //Если в течение 60 сек после отправки точки замедления акселерометр фиксирует сработки, но через 60 сек напряжения бортовой сети оказывается ниже 13,5V (27,0V) - трекер фиксирует точку замедления, как точку стоянки
            var condition_2 = true;
            for (i = 0; i < interval_1.length; i++) {
                if (isMotorOn (interval_1 [i])) {
                    condition_2 = false;
                    break;
                }
            }
            if (condition_2)
                return true;
            //Если в течение 60 сек после отправки точки замедления акселерометр фиксирует сработки, через 60 сек напряжения бортовой сети не опускается ниже 13,5V (27,0V), но трекер перемещается менее чем на 10 метров (программируется) - трекер фиксирует точку замедления, как точку стоянки
            var condition_3 = true;
            for (i = 0; i < interval_1.length; i ++) {
                if (distance (slowingPoint, interval_1 [i]) < minDistance) {
                    condition_3 = false;
                    break;
                }
            }
            if (condition_3)
                return true;
            //Если в интервале 60...120 сек после отправки точки замедления акселерометр не фиксирует сработок - трекер фиксирует точку замедления, как точку стоянки
            var condition_4 = true;
            for (;i < interval_1.length; i++) {
                if (isAccelerometerOn (interval_1 [i])) {
                    condition_4 = false;
                    break;
                }
            }
            if (condition_4)
                return true;
            //Если в интервале 60...120 сек после отправки точки замедления акселерометр фиксирует сработки, но через 120 сек напряжения бортовой сети оказывается ниже 13,5V (27,0V) - трекер фиксирует точку замедления, как точку стоянки
            var condition_5 = true;
            for (i = 0; i < interval_2.length; i++) {
                if (isMotorOn (interval_2 [i])) {
                    condition_5 = false;
                    break;
                }
            }
            if (condition_5)
                return true;
            //Если в интервале 60...120 сек после отправки точки замедления акселерометр фиксирует сработки, через 120 сек напряжения бортовой сети не опускается ниже 13,5V (27,0V), но трекер перемещается менее чем на 20 метров - трекер фиксирует точку замедления, как точку стоянки
            var condition_6 = true;
            for (i = 0; i < interval_2.length; i ++) {
                if (distance (slowingPoint, interval_2 [i]) < minDistance_2) {
                    condition_6 = false;
                    break;
                }
            }
            if (condition_6)
                return true;

            return false;
        };

        var addPointToInterval = function (slowingPoint, point, interval_0, interval_1, interval_2) {
            var slowingInterval = point.dt - slowingPoint.dt;
            var zeroInterval =  GeoGPS.options.interval_0;
            var firstInterval = GeoGPS.options.interval_1;
            var secondInterval = GeoGPS.options.interval_2;
            if (slowingInterval < zeroInterval) {
                interval_0.push (point);
            } else if (slowingInterval >= zeroInterval && slowingInterval < firstInterval) {
                interval_1.push (point);
            } else if (slowingInterval >= firstInterval && slowingInterval < secondInterval) {
                interval_2.push (point);
            } else {
                return false;
            }
            return true;
        };

        var setPointType = function (point, type) {
            point.type = type;
        };
        var setPointsType = function (points, indexStart, indexStop, type) {
            for (var i = indexStart; i < indexStop; i++) {
                setPointType (points [i], type);
            }
        };
        var copyPointParams = function (pointFrom, pointTo) {
            pointTo.lat = pointFrom.lat;
            pointTo.lon = pointFrom.lon;
        };

        var identifyPointsType = function (points) {
            var slowingPoint = null;
            var stopPoint = null;
            var movePoint = null;
            var interval_0 = [];
            var interval_1 = [];
            var interval_2 = [];
            for (var i = 0; i < points.length; i++) {
                var point = points [i];
                if (movePoint === null) {
                    if (slowingPoint === null && isStartMoving (points, i)) {
                        movePoint = i;
                        stopPoint = null;
                        setPointType (point, POINTTYPE.MOVE);
                        continue;
                    } else {
                        setPointType (point, POINTTYPE.STOP);
                    }
                } else {
                    setPointType (point, POINTTYPE.MOVE);
                }
                if (slowingPoint === null && stopPoint === null) {
                    if (isSlowingPoint (point) || movePoint === null) {
                        slowingPoint = i;
                        interval_0 = [];
                        interval_1 = [];
                        interval_2 = [];
                        continue;
                    }
                }
                if (stopPoint === null) {
                    if (slowingPoint !== null) {
                        var etalonStopPoint = points [slowingPoint];
                        if (addPointToInterval (etalonStopPoint, interval_0, interval_1, interval_2)) {
                            continue;
                        }
                        if (isStopMoving (etalonStopPoint, interval_0, interval_1, interval_2)) {
                            stopPoint = i;
                            /*for (var j = slowingPoint + 1; j <= stopPoint; j++) {
                                copyPointParams (etalonStopPoint, points [j]);
                            }*/
                            if (movePoint !== null) {
                                setPointsType (points, movePoint, slowingPoint, POINTTYPE.MOVE);
                                setPointsType (points, slowingPoint, stopPoint, POINTTYPE.STOP);
                                movePoint = null;
                            }
                        }
                        slowingPoint = null;
                    } else if (movePoint !== null) {
                        setPointType (point, POINTTYPE.MOVE);
                    } else {
                        setPointType (point, POINTTYPE.STOP);
                    }
                } else if (movePoint === null) {
                    //copyPointParams (points [stopPoint], point);
                    setPointType (point, POINTTYPE.STOP);
                }
            }
            if (slowingPoint !== null) {
                for (var k = slowingPoint; k < points.length; k++) {
                    points [k].type = POINTTYPE.STOP;
                }
            }
            /*for (var k = 0; k < points.length; k++) {
                if (points [k].type == undefined)
                    setPointType (points [k], POINTTYPE.STOP);
            }*/
        };
////////////////////////////////////////////////////////////////////
        var bingpsparse_2 = function (array, hoursFrom) {
            var points = [];
            for (var i = 0; i < array.length; i += 32) {
                var point = parse_onebin(array.subarray(i, i + 32));
                if (point) {
                    points.push(point);
                }
            }
            if (points.length === 0) {
                return;
            }
            //////  добавить точку в конец трека с временем 23:59:59 если выбран не текущий день
            if (GeoGPS.options.addPoint_23_59) {
                var addP = angular.copy(points [points.length - 1]);
                var date = new Date();
                var tz = (date).getTimezoneOffset() / 60;
                var day = (new Date (addP.dt * 1000).valueOf() / 1000 / 3600) / 24;
                var dayNow = date.valueOf() / 1000 / 3600 / 24;
                if (Math.floor(day) != Math.floor(dayNow)) {
                    var oldValue = addP.dt;
                    var newValue = ~~(addP.dt / 3600);
                    newValue = ~~(newValue / 24);
                    newValue = (newValue * 24 + tz + 23) * 3600 + 3599;
                    addP.dt = newValue;
                    if (newValue < (oldValue + 3600)) {
                        points.push (addP);
                    }
                }
            }
            ///////
            if (GeoGPS.options.useServerFiltration) {
                identifyPointsType (points);
            }
            if (GeoGPS.options.filter_invalidPoints)
                points = removeInvalidPoints (points);
            if (GeoGPS.options.correctFromHours > 0)
                points = transferStopPoint (points, hoursFrom);
            if (GeoGPS.options.filter_ejection)
                points = removeLargeMoveInShortTime (points);
            if (GeoGPS.options.filter_shortTraveled)
                points = removeShortTrips (points);
            if (GeoGPS.options.filter_clearStopPoints)
                clearStopPointsCoordinates (points);
            updatePointsFuel (points);
            var events = GeoGPS.getEventsFromPoints (points, 0, points.length, system);
            var bounds = GeoGPS.getBoundsFromPoints (points, 0, points.length);
            var track = GeoGPS.getTrackFromPoints (points, 0, points.length);
            var ranges = GeoGPS.getRangesFromPoints (points, 0, points.length);
            var hours = GeoGPS.getHoursFromPoints (points, 0, points.length);
            var ret = {
                track: track,
                bounds: bounds,
                points: points,
                min_hour: hours.min || 0,
                max_hour: hours.max || 1e15,
                hours: hours,
                events: events,
                ranges: ranges
            };
            //console.log ("track : ", ret);
            return ret;
        };

////////////////////////////////////////////////////////////////////
        var bingpsparse = function(array, hoursFrom, offset) {
            // console.log('parse');
            var track = [];
            var points = [];
            var events = []; // События на треке: Старт, стоп, стоянки (момент), остановки (момент), заправки и т.д.
            var ranges = []; // Интервалы: Движение, стоянка, остановка
            var bounds = null;
            var min_hour = 1e15;
            var max_hour = 0;
            var hours = {};
            var range_start;
            var stop_start = null; // Точка начала стоянки/остановки
            var move_start = null; // Точка начала движения
            var firstHour = hoursFrom;
            var lastStopPoint = null;
            var lastStopgPoint = null;
            var prevPointIsStop = false;
            var cleared = false;

            var index = 0;

            var fuelscale = System.$fuelscale(skey);
            var prevpoint = null;

            for (var i = 0; i < array.length; i += 32) {
                var point = parse_onebin(array.subarray(i, i + 32));
                // console.log('point', point);
                if(point !== null && point.fuel) {
                    point.fuel = fuelscale(point.fuel);
                }
                if (point) {
                    var gpoint = new google.maps.LatLng(point.lat, point.lon);
                    var hour = ~~ (point.dt / 3600);
                    if(!options.raw){// этот блок находит координату последней стоянки и позаоляет перенести координаты стоянки на следующие сутки (подразумевается что запрос бинарных данных был сделан с учетом предыдущих correctFromHours часов)
                        //if (firstHour === null)
                            //firstHour = hour;
                        if (!cleared && hour > firstHour + offset) {
                            //console.log ('clear pev ' + correctFromHours + ' hours');
                            cleared = true;
                            if (prevPointIsStop) {
                                gpoint = lastStopgPoint;
                                point.lat = lastStopPoint.lat;
                                point.lon = lastStopPoint.lon;
                                point.dt = hour * 3600;
                                //i -= 32;
                            }
                        } else if (!cleared) {
                            if (isStop (point)) {
                                 if (!prevPointIsStop) {
                                     prevPointIsStop = true;
                                     lastStopgPoint = gpoint;
                                     lastStopPoint = point;
                                 }
                            } else {
                                prevPointIsStop = false;
                            }
                            continue;
                        }
                    }

                    // if(prevpoint){
                    //     var d = distance(point, prevpoint);
                    //     if(d > 4.0){
                    //         window.console.log(d, new Date(point.dt * 1000));
                    //         continue;
                    //     }
                    // }
                    // prevpoint = point;

                    if (bounds === null) {
                        bounds = new google.maps.LatLngBounds(gpoint, gpoint);
                    } else {
                        bounds.extend(gpoint);
                    }

                    points.push(point);

                    if (hour < min_hour) min_hour = hour;
                    if (hour > max_hour) max_hour = hour;
                    hours[hour] = (hours[hour] || 0) + 1;

                    if (events.length === 0) { // Первая точка
                        events.push({
                            point: point,
                            position: gpoint,
                            type: 'START',
                            index: index
                        });
                        range_start = point;

                        if (isStop(point)) {
                            stop_start = 0;
                            events.push({
                                point: point,
                                position: gpoint,
                                type: 'STOP', // Стоянка/остановка (тит пока не определен)
                                index: index
                            });
                        } else {
                            move_start = 0;
                        }
                    }
                    if (isStop(point)) {
                        if (stop_start === null) {
                            stop_start = index;
                            events.push({
                                point: point,
                                position: gpoint,
                                type: 'STOP', // Стоянка/остановка (тит пока не определен)
                                index: index
                            });
                        } else {
                            gpoint = new google.maps.LatLng(points[stop_start].lat, points[stop_start].lon);
                        }
                        if (move_start !== null) {
                            ranges.push({
                                type: 'MOVE', // Движение
                                start_index: move_start,
                                start: points[move_start],
                                stop_index: index,
                                stop: points[index]
                            });
                            move_start = null;
                        }
                        // Уберем фантомные точки в стоянке
                        if(!options.raw){
                            points[points.length-1].lat = points[stop_start].lat;
                            points[points.length-1].lon = points[stop_start].lon;
                        }
                    } else /*if(point['fsource'] === FSOURCE_START)*/ {
                        if (stop_start !== null) {
                            var lastevent = events[events.length - 1];
                            lastevent.end = point;
                            if (lastevent.type === 'STOP') {
                                var system = System.cached(skey);
                                var treshold = 5;
                                if (system && system.car && system.car.stop) {
                                    treshold = system.car.stop | 0;
                                }
                                var duration = lastevent.end.dt - lastevent.point.dt;
                                if (duration < treshold * 60) {
                                    lastevent.type = 'HOLD';
                                }
                            }
                            ranges.push({
                                type: 'STOP', // Стоянка/остановка (тит пока не определен)
                                start_index: stop_start,
                                start: points[stop_start],
                                stop_index: index,
                                stop: points[index]
                            });
                            stop_start = null;
                        }
                        if (move_start === null) {
                            move_start = index;
                        }
                    }
                    /* else {
                stop_start = null;
                if(!move_start){
                    move_start = index;
                }
            }*/
                    track.push(gpoint);

                    index += 1;
                }
            }

            if (index > 0) {
                events.push({
                    point: points[index - 1],
                    position: track[index - 1],
                    type: 'FINISH',
                    index: index - 1
                });
                if (stop_start !== null) {
                    ranges.push({
                        type: 'STOP', // Стоянка/остановка (тит пока не определен)
                        start_index: stop_start,
                        start: points[stop_start],
                        stop_index: index - 1,
                        stop: points[index - 1]
                    });
                } else if (move_start !== null) {
                    ranges.push({
                        type: 'MOVE', // Движение
                        start_index: move_start,
                        start: points[move_start],
                        stop_index: index - 1,
                        stop: points[index - 1]
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

        GeoGPS.select = function(newskey) {
            skey = newskey;
            system = System.cached(newskey); // Тут есть потенциальная опасность если данные на момент выбора еще не готовы
        };

        GeoGPS.setOptions = function(newoptions) {
            angular.extend(options, newoptions);
        };

        GeoGPS.getOptions = function() {
            // return angular.copy(options);
            return options;
        };

        GeoGPS.getHours = function(hourfrom, hourto) {
            var defer = $q.defer();
            // console.log(['GeoGPS.getHours', skey, hourfrom, hourto, defer]);
            $http({
                method: 'GET',
                cache: false,
                withCredentials: SERVER.api_withCredentials,
                url: SERVER.api + '/geos/' + encodeURIComponent(skey) + '/hours',
                params: {
                    from: hourfrom,
                    to: hourto,
                    rand: (Math.random() * 1e18) | 0
                }
            }).success(function(data) {
                // console.log('hours data=', data);
                days = {};
                if (!data || (data.hours.length === 0)) {
                    // callback([]);
                    // defer.reject();
                } else {
                    // callback(data.hours);
                    for (var i = 0, l = data.hours.length; i < l; i++) {
                        var hour = data.hours[i];
                        var date = new Date(hour * 3600 * 1000);
                        date.setHours(0);
                        date.setMinutes(0);
                        date.setSeconds(0);
                        date.setMilliseconds(0);
                        //var dayhour = date.getTime()/1000/3600; // Первый час суток
                        var dateepoch = (new Date(date.toDateString() + ' GMT')) / 1000 / 3600 / 24;
                        if (dateepoch in days) {
                            days[dateepoch] += 1;
                            // console.log('set', days);
                        } else {
                            days[dateepoch] = 1;
                            // console.log('grow', days);
                        }
                        // console.log('hour', hour, '->', date.toDateString(), dayhour, dateepoch);
                    }
                }
                defer.resolve();
            });
            return defer.promise;
        };

        GeoGPS.checkDay = function(day) {
            return day in days;
        };

        GeoGPS.getTrack = function(hourfrom, hourto, noUpdateOptions) {
            //TODO: исправить очень опасно так как это работает только зимой после перехода на зимнее время
            // 1 час это смеещение изза перехода на зимнее время
            if (!noUpdateOptions) {
                loadOptions ();
                var system = System.cached(skey);
                options.updateValues (system);
            }
            console.log ("getTrack----> options : ", options);
            if(!options.raw){
                hourfrom -= GeoGPS.options.correctFromHours;// + 1; //получаем данные на correctFromHours раньше чем запросили что бы получить корректные координаты стоянки
            }
            var defer = $q.defer();
            // console.log('getTrack', skey, hourfrom, hourto);

            // GeoGPS.hideTrack();
            $http({
                method: 'GET',
                cache: false,
                withCredentials: SERVER.api_withCredentials,
                headers: {
                    'Accept': 'application/octet-stream'
                },
                responseType: 'arraybuffer',
                url: SERVER.api + '/geos/' + encodeURIComponent(skey),
                params: {
                    from: hourfrom,
                    to: hourto
                }
            }).success(function(data) {
                // console.log('GeoGPS.getTrack.success', data);
                if (!data) {
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
                if(options.raw){
                    defer.resolve(bingpsparse(uInt8Array, hourfrom, 0));
                } else {
                    defer.resolve(bingpsparse_2(uInt8Array, hourfrom, noUpdateOptions));
                }
            }).error(function(data, status) {
                window.console.error('GeoGPS.getTrack.error', data, status);
            });
            return defer.promise;
        };

        // GeoGPS.hideTrack = function(){
        //     if(path) {
        //         path.setMap(null);
        //         path = null;
        //     }
        // };

        var distance = function(p1, p2) {
            var R = 6371; // km (change this constant to get miles)
            var dLat = (p2.lat - p1.lat) * Math.PI / 180;
            var dLon = (p2.lon - p1.lon) * Math.PI / 180;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
        };
        GeoGPS.distance = distance;

        // Инициирует данные для бинарного поиска
        GeoGPS.initQuadtree = function(points){
            // console.log('initQuadtree points=', points, this);

            var quadtree = d3.geom.quadtree()
                .x(function(d){return d.lat;})
                .y(function(d){return d.lon;});
                // .data(points);

            // var quadtree = d3.geom.quadtree()
            //     .extent([[-1, -1], [width + 1, height + 1]])
            //     (data);

            return quadtree(points);
        };

        GeoGPS.findInQuadtree = function(quadtree, point, size) {
            // var size = 0.006 * Math.pow(2,13 - mapzoom);    // Что за хрень?
            // var size = 0.005;
            if(size < 0.0001) size = 0.0001;
            var clat = Math.cos(point.lat * Math.PI / 180);
            if(clat < 0.0001) clat = 0.0001;


            // var bound = new google.maps.LatLngBounds(
            //     new google.maps.LatLng(point.lat - size*clat, point.lon - size ),
            //     new google.maps.LatLng(point.lat + size*clat, point.lon + size )
            // );

            // console.log('bound = ', bound); // x0, y0, x3, y3
            var x0 = point.lat - size * clat,
                y0 = point.lon - size,
                x3 = point.lat + size * clat,
                y3 = point.lon + size;


            var nearestpoints = [];
            var visits = 0;

            quadtree.visit(function(node, x1, y1, x2, y2){
                visits++;
                var p = node.point;
                if (p) {
                    if((p.lat >= x0) && (p.lat < x3) && (p.lon >= y0) && (p.lon < y3)) {
                        // console.log(node, x1, y1, x2, y2, p);
                        nearestpoints.push(p);
                    }
                }
                return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
            });
            // console.log('visits=', visits, nearestpoints.length);
            // Если не нашли точек, то необходимо расширить зону поиска

            return nearestpoints;

        };




        return GeoGPS;
    }
]);

})();
