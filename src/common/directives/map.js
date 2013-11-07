/* global angular:true, window:true, google:true, moment:true, $:true, console:true */

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
                scaleControl: true,
                zoom: prev_config.zoom
            };
            var map_element = element.find('.gmap-container');
            // console.log('map_element=', map_element);
            var map = new google.maps.Map(map_element[0], myOptions);
            // console.log('scope=', scope);
            // scope.gmap(map);
            scope.map = map;

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
                        lat: event.latLng.lat(),    //lat: event.latLng.lb,
                        lon: event.latLng.lng()     //lon: event.latLng.mb
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

    // console.log('data=', angular.copy(data));
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
                if ((data === null) || (data.points.length === 0)) {
                    if (select) {
                        select.setPath([]);
                    }
                    return;
                }
                showTrack(data);
            }, true);

            var lastmarker = new LastMarker(map);

            var updateLastMarkers = function(){
                if (!scope.systems) return;
                var lastpos = [];
                angular.forEach(scope.systems, function(sys) {
                    if (sys.dynamic && sys.dynamic.latitude) {
                        var off = scope.account.account.off;
                        if (!off.hasOwnProperty(sys.id)) {
                            var hidden = false;

                            if(scope.sfilter){  // Назначен фильтр
                                if(!sys.tags) hidden = true;   // Ярлыки не назначены вовсе
                                else if(sys.tags.length === 0) hidden = true;   // Ярлыки не назначены вовсе
                                else if(sys.tags.indexOf(scope.sfilter.filter) === -1) hidden = true;   // Ятрыка в списке нет
                            }
                            // console.log('sys=', sys, scope.sfilter);
                            lastpos.push({
                                key: sys.id,
                                title: sys.title,
                                icon: sys.icon,
                                dynamic: sys.dynamic,
                                hidden: hidden,
                                hasFuelSensor: sys.car.hasFuelSensor
                            });
                        }
                    }
                });
                lastmarker.setData(lastpos);
            };

            scope.$watch('systems', function() {
                updateLastMarkers();
            }, true);


            scope.$watch('sfilter', function(){
                updateLastMarkers();
            });

            scope.hideTrack = function(){
                // console.log('gmap:hideTrack');
                scope.track.track = [];
                scope.track.points = [];
                scope.track.ranges = [];

                scope.onHide();

                // $scope.track.track = [];
                // $scope.track.points = [];
                // $scope.track.ranges = [];
            };


            // '<div class="map-search">'
            //     '<div class="input-group">'
            //         '<span class="input-group-addon"><i class="icon-search icon-large"></i></span>'
            //         '<input type="text" class="form-control" google-maps-search="bounds">'
            //     '</div>'
            // '</div>'

        };

        return {
            restrict: 'E',
            transclude: false,
            template:
                '<div class="gmap">'+
                    '<div class="gmap-container"></div>'+
                    '<gmap-search map="map"></gmap-search>'+
                    '<gmap-tool-bar map="map" config="config" on-hide="hideTrack()"></gmap-tool-bar>'+
                '</div>',
            replace: true,
            scope: {
                track:   '=',
                config:  '=',
                center:  '=',
                account: '=',
                systems: '=',
                onHide: '&',
                sfilter: '=sfilter'
            },
            link: link
        };
    }
])

.directive('gmapToolBar', [
    function() {
        'use strict';

        var link = function(scope) {
            // console.log('gmapToolBar:link', scope);

            scope.showconfig = false;

            scope.$watch('config.numbers', function() {
                if (scope.config.numbers) {
                    $('.eventmarker .track.STOP .eventmarker-nonumber').attr('style', '');
                    $('.eventmarker .track.STOP .eventmarker-number').attr('style', 'display: initial');
                } else {
                    $('.eventmarker .track.STOP .eventmarker-nonumber').attr('style', 'display: initial');
                    $('.eventmarker .track.STOP .eventmarker-number').attr('style', 'display: none');
                }
            });

            scope.hideTrack = function(){
                // console.log('hideTrack');
                scope.onHide();
            };

        };
        return {
            restrict: 'E',
            // require: '^gmap',
            templateUrl: 'templates/map/gmap-tool-bar.tpl.html',
            replace: true,
            scope: {
                map: '=',
                config: '=',
                onHide: '&'
            },
            link: link
        };
    }
])

.directive('gmapSearch', [
    function() {
        'use strict';

        var link = function(scope, element) {
            // console.log('gmapSearch:link', scope, element);

            var inputs = element.find('input');

            var autocomplete = new google.maps.places.Autocomplete(inputs[0]);
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                if (!place.geometry) return;

                if (place.geometry.viewport) {
                    scope.map.fitBounds(place.geometry.viewport);

                } else {
                    scope.map.setCenter(place.geometry.location);
                    scope.map.setZoom(17);  // Why 17? Because it looks good.
                }
            });


            var geocoder = new google.maps.Geocoder();
            var input_from = inputs[1];
            var route_from = null,
                route_to = null;

            // null;
            var directionsDisplay = new google.maps.DirectionsRenderer({
                'map': scope.map,
                //'preserveViewport': true,
                'hideRouteList': true,
                'draggable': true
                //'suppressMarkers': true
                //'panel': dir_panel.querySelector('#directions_panel')
                //'markerOptions': {icon: }
            });

            var currentDirections = null;
            scope.distance = '';
            scope.duration = '';

            google.maps.event.addListener(directionsDisplay, 'directions_changed', function(){
                // console.log('directions_changed');
                currentDirections = directionsDisplay.getDirections();
                if(currentDirections.routes.length>1){
                    console.log('Предлагается более одного маршрута');
                }
                var leg = currentDirections.routes[0].legs[0];
                // for(var i=0, l=leg.via_waypoint.length+2-points.length; i<l; i++){
                //     add_way_point('');
                // }
                // console.log('currentDirections=', currentDirections, leg);

                // points[0].point_div.querySelector('input').value = leg.start_address;
                // //if(points[0].marker) points[0].marker.setPosition(leg.start_location);
                // setMarker(points[0], leg.start_location);

                // points[points.length-1].point_div.querySelector('input').value = leg.end_address;
                // //if(points[points.length-1].marker) points[points.length-1].marker.setPosition(leg.end_location);
                // setMarker(points[points.length-1], leg.end_location);

                // for(var i=0, l=leg.via_waypoints.length; i<l; i++){
                //     points[i+1].point_div.querySelector('input').value = leg.via_waypoints[i].toString();  Требуется определение адреса

                //     //if(points[i+1].marker) points[i+1].marker.setPosition(leg.via_waypoint[i].location);
                //     setMarker(points[i+1], leg.via_waypoints[i]);
                // }

                scope.$apply(function(){
                    scope.distance = currentDirections.routes[0].legs[0].distance.text;
                    scope.duration = currentDirections.routes[0].legs[0].duration.text;
                });
            });

            var directionsService = new google.maps.DirectionsService();
            // console.log('directionsService=', directionsService);
            var route = function(){
                if((route_from === null) || (route_to === null)) return;
                if(from_marker !== null) {
                    from_marker.setMap(null);
                }
                if(to_marker !== null) {
                    to_marker.setMap(null);
                }
                var request = {
                    origin: route_from,
                    destination: route_to,
                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                    unitSystem : google.maps.DirectionsUnitSystem.METRIC,
                    region: 'de'
                };

                directionsService.route(request, function(response, status) {
                    // console.log('Route done', response, status);
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });

            };

            var autocomplete_from = new google.maps.places.Autocomplete(input_from);
            $(input_from).attr('placeholder', 'Начальная точка');

            google.maps.event.addListener(autocomplete_from, 'place_changed', function() {
                var place = autocomplete_from.getPlace();
                if (!place.geometry) return;

                // console.log('route_from', place, );
                route_from = place.geometry.location;
                if (place.geometry.viewport) {
                    scope.map.fitBounds(place.geometry.viewport);
                } else {
                    scope.map.setCenter(place.geometry.location);
                    scope.map.setZoom(17);  // Why 17? Because it looks good.
                }
                route();
            });

            var input_to = inputs[2];
            var autocomplete_to = new google.maps.places.Autocomplete(input_to);
            $(input_to).attr('placeholder', 'Конечная точка');

            google.maps.event.addListener(autocomplete_to, 'place_changed', function() {
                var place = autocomplete_to.getPlace();
                if (!place.geometry) return;

                route_to = place.geometry.location;
                if (place.geometry.viewport) {
                    scope.map.fitBounds(place.geometry.viewport);
                } else {
                    scope.map.setCenter(place.geometry.location);
                    scope.map.setZoom(17);  // Why 17? Because it looks good.
                }
                route();
            });

            scope.onSearch = function(){
                $(inputs[0]).focus();
            };

            scope.showroute = false;
            scope.onRoute = function(){
                // console.log('TODO route');
                scope.showroute = !scope.showroute;
            };

            var from_marker = null;
            var geocodeStart = function(){
                geocoder.geocode({'latLng': from_marker.getPosition()}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var address = results[0].formatted_address;
                        // console.log(address, results);
                        $(input_from).val(address);
                    }
                });
            };

            scope.onStart = function() {
                $(input_from).attr('placeholder', 'Укажите точку на карте...');
                google.maps.event.addListenerOnce(scope.map, 'click', function(event){
                    var position = event.latLng;
                    route_from = position;
                    // console.log('Start point', position);

                    if(from_marker === null){
                        from_marker = new google.maps.Marker({
                            position: position,
                            map: scope.map,
                            title: 'Старт',
                            //icon: $.gmap.images['start'],
                            draggable: true
                        });
                    } else {
                        from_marker.setPosition(position);
                    }
                    geocodeStart();
                    route();

                    // setMarker(point_data, event.latLng);
                });
            };

            var to_marker = null;
            var geocodeFinish = function(){
                geocoder.geocode({'latLng': to_marker.getPosition()}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var address = results[0].formatted_address;
                        // console.log(address, results);
                        $(input_to).val(address);
                    }
                });
            };

            scope.onFinish = function() {
                $(input_to).attr('placeholder', 'Укажите точку на карте...');
                google.maps.event.addListenerOnce(scope.map, 'click', function(event){
                    var position = event.latLng;
                    route_to = position;
                    // console.log('Finish point', event.latLng);
                    // setMarker(point_data, event.latLng);
                    if(to_marker === null){
                        to_marker = new google.maps.Marker({
                            position: position,
                            map: scope.map,
                            title: 'Старт',
                            //icon: $.gmap.images['start'],
                            draggable: true
                        });
                    } else {
                        to_marker.setPosition(position);
                    }
                    geocodeFinish();
                    route();
                });
            };

        };
        return {
            restrict: 'E',
            // require: '^gmap',
            templateUrl: 'templates/map/gmap-search.tpl.html',
            replace: true,
            scope: {
                map: '='
            },
            link: link
        };
    }
])

.directive('configMapItem', function() {
    'use strict';
    return {
        restrict: 'EA',
        scope: {
            item: '=',
            iconOn: '@',
            iconOff: '@'
        },
        replace: true,
        transclude: true,
        template: '<li ng-click=\'toggleValue()\'><span></span><span ng-transclude></span></li>',
        link: function(scope, element) {
            var icon = element[0].querySelector('span');
            scope.toggleValue = function() {
                scope.item = !scope.item;
            };
            scope.$watch('item', function(item) {
                icon.className = 'icon-' + (item ? scope.iconOn : scope.iconOff) + ' icon-large';
                if (item) {
                    element.addClass('on');
                    element.removeClass('off');
                } else {
                    element.addClass('off');
                    element.removeClass('on');
                }
            });
        }
    };
});
