/* global angular:true, window:true, google:true, moment:true */

// Enable the visual refresh
if (google && google.maps) {
    google.maps.visualRefresh = true;
}

angular.module('directives.gmap', ['services.connect', 'services.eventmarker', 'services.lastmarker' /*, 'ui'*/ ])

.directive('gmap', ['Connect', 'EventMarker', 'LastMarker',
    function(Connect, EventMarker, LastMarker) {
        'use strict';

        // TODO! Необходима унификация для поддержки как минимум Google Maps и Leaflet

        var link = function(scope, element) {
            var path = null,
                select = null,
                gmarker = null;

            if (!window.hasOwnProperty('google')) {
                window.alert('Сервис Google Карт в данный момент недоступен. Попробуйте перезагрузить страницу.');
            }

            var prev_config = window.localStorage.getItem('map.config');
            if (prev_config) {
                prev_config = JSON.parse(prev_config);
            } else {
                prev_config = {
                    zoom: 6,
                    center: [48.370848, 32.717285],
                    typeId: google.maps.MapTypeId.ROADMAP
                };
            }

            // var latlng = new google.maps.LatLng(48.397, 34.644);
            var myOptions = {
                center: new google.maps.LatLng(prev_config.center[0], prev_config.center[1]),
                mapTypeId: prev_config.typeId,
                zoom: prev_config.zoom
            };
            var map = new google.maps.Map(element[0], myOptions);

            var saveMapState = function() {
                window.localStorage.setItem('map.config', JSON.stringify({
                    center: [map.getCenter().lat(), map.getCenter().lng()],
                    zoom: map.getZoom(),
                    typeId: map.getMapTypeId()
                }));
            };

            google.maps.event.addListener(map, 'idle', saveMapState);
            google.maps.event.addListener(map, 'maptypeid_changed', saveMapState);

            google.maps.event.addListener(map, 'zoom_changed', function() {
                // console.log('zoom_changed');
                //PathRebuild();    // TODO! Разная детализация трека, по аналогии со старым сайтом
            });

            if (scope.config.centermarker) {
                var center = new google.maps.MarkerImage(
                    '/img/marker/marker-center.png?v=1',
                    new google.maps.Size(32, 32),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(15, 15)
                );

                gmarker = new google.maps.Marker({
                    //position: new google.maps.LatLng(data.stops[i].p[0], data.stops[i].p[1]),
                    map: map,
                    title: 'Положение',
                    icon: center,
                    draggable: false
                });
            }
            scope.$watch('center', function(center) {
                if (center) {
                    var pos = new google.maps.LatLng(center.lat, center.lon);
                    map.panTo(pos);
                    if (scope.config.centermarker) {
                        gmarker.setPosition(pos);
                    }
                }
            });

            var eventmarker = new EventMarker(map);

            // var eventmarkers = {};

            function animateCircle() {
                var count = 0;
                window.setInterval(function() {
                    if (path === null) return; // FIXME: Не самое элегантное решение
                    if (!scope.config.animation) return; // FIXME: Не самое элегантное решение

                    count = (count + 1) % 50;

                    var icons = path.get('icons');
                    icons[0].offset = (count * 2) + 'px';
                    path.set('icons', icons);
                }, 250);
            }
            animateCircle();

            scope.points = [];

            var updatePoints = function(points) {
                scope.points = points;
            };

            scope.distance = function(p1, p2) {
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

            scope.findNearestPoint = function(M) {
                if (scope.points.length === 0)
                    return null;
                var points = scope.points;
                var point = null;
                var minDistance = 1000000000;
                //console.log(scope);
                for (var i = 0; i < points.length; ++i) {
                    var distance = scope.distance(points[i], M);
                    if (minDistance > distance) {
                        point = points[i];
                        minDistance = distance;
                    }
                }
                return point;
            };

            scope.infowindow = new google.maps.InfoWindow();

            var showTrack = function(data) {
                if (scope.infowindow !== null)
                    scope.infowindow.close();
                updatePoints(data.points);
                path = new google.maps.Polyline({
                    path: data.track,
                    strokeColor: 'blue',
                    strokeOpacity: 0.5, //data.select ? 0.7 : 0.5,
                    strokeWeight: data.select ? 2 : 5,
                    // editable: true,
                    icons: [{
                        icon: {
                            // path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            strokeColor: 'red',
                            strokeWeight: 2,
                            scale: 3
                        },
                        offset: '50px',
                        repeat: '100px'
                    }],
                    map: map
                });

                google.maps.event.addListener(path, 'click', function(event) {
                    var point = scope.findNearestPoint({
                        lat: event.latLng.lb,
                        lon: event.latLng.mb
                    });
                    if (point === null) return;
                    var timeStr = moment(new Date((point.dt * 1000))).format('DD/MM/YYYY : hh:mm');
                    var lat = Math.round(point.lat * 100000) / 100000;
                    var lon = Math.round(point.lon * 100000) / 100000;
                    var sats = point.sats;
                    var speed = Math.round(point.speed * 10) / 10;
                    var vin = Math.round(point.vin * 100) / 100;
                    var vout = Math.round(point.vout * 100) / 100;
                    var content = '<div class="info-header">' + timeStr + '</div><table id="tbl_info" width="100%"><tbody><tr><td>Долгота:</td><td><b>' + lat + '</b></td></tr><tr><td>Широта:</td><td><b>' + lon + '</b></td></tr><tr><td>Спутники</td><td><b>' + sats + '</b></td></tr><tr><td>Скорость</td><td><b>' + speed + 'км/ч</b></td></tr><tr><td>Основное питание</td><td><b>' + vout + 'В</b></td></tr><tr><td>Резервное питание</td><td><b>' + vin + 'В</b></td></tr></tbody></table>';
                    scope.infowindow.setContent(content);
                    scope.infowindow.setPosition(new google.maps.LatLng(point.lat, point.lon));
                    scope.infowindow.open(map);
                });

                if (data.select) {
                    var start = data.select.start_index;
                    var stop = data.select.stop_index;
                    if (data.select.type === 'MOVE') {
                        start = Math.max(0, start - 1);
                        stop = Math.min(data.track.length - 1, stop + 1);
                    }
                    var fragment = data.track.slice(start, stop);
                    var bounds = new google.maps.LatLngBounds(fragment[0], fragment[0]);

                    fragment.forEach(function(point) {
                        bounds.extend(point);
                    });
                    map.fitBounds(bounds);

                    if (select) {
                        select.setPath(fragment);
                    } else {
                        select = new google.maps.Polyline({
                            path: fragment,
                            strokeColor: 'green',
                            strokeOpacity: 0.8,
                            strokeWeight: 7,
                            map: map
                        });
                    }
                } else {
                    if (select) {
                        select.setPath([]);
                    }
                    if (scope.config.autobounds) {
                        map.fitBounds(data.bounds);
                    }
                }
                eventmarker.setData(data.events);
            };

            // TODO. Не нравится мне чтото это. Заменить бып на событие.
            scope.$watch('track', function(data) {
                if (path) {
                    path.setMap(null);
                    path = null;
                    eventmarker.setData([]);
                }
                if ((data === null) || (data.points.length === 0)) return;
                showTrack(data);
            }, true);

            var lastmarker = new LastMarker(map);

            scope.$watch('systems', function(systems) {
                if (!systems) return;
                var lastpos = [];
                angular.forEach(systems, function(sys) {
                    if (sys.dynamic && sys.dynamic.latitude) {
                        var off = scope.account.account.off;
                        if (!off.hasOwnProperty(sys.id)) {
                            lastpos.push({
                                key: sys.id,
                                title: sys.title,
                                icon: sys.icon,
                                dynamic: sys.dynamic,
                                hasFuelSensor: sys.car.hasFuelSensor
                            });
                        }
                    }
                });
                lastmarker.setData(lastpos);
            }, true);
        };

        return {
            restrict: 'A',
            transclude: false,
            scope: {
                track:   '=',
                config:  '=',
                center:  '=',
                account: '=',
                systems: '='
            },
            link: link
        };
    }
]);

