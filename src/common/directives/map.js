/* global angular:true, window:true, google:true, $:true, console:true */

;(function(){

    'use strict';

    function atanh(x) {
        return 0.5*Math.log((1+x)/(1-x));
    }

    var MERCATOR_RANGE = 256;
    // function degreesToRadians(deg) {
    //     return deg * (Math.PI / 180);
    // }

    // function radiansToDegrees(rad) {
    //     return rad / (Math.PI / 180);
    // }
    // function bound(value, opt_min, opt_max) {
    //     if (opt_min !== null) value = Math.max(value, opt_min);
    //     if (opt_max !== null) value = Math.min(value, opt_max);
    //     return value;
    // }

    function YandexProjection() {
        this.pixelOrigin_ = new google.maps.Point(128,128);
        this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
        this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
    }

    YandexProjection.prototype.fromLatLngToPoint = function(latLng) {
        var me = this;
        var point = new google.maps.Point(0, 0);
        var origin = me.pixelOrigin_;
        // var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
        point.x = origin.x + latLng.lng() *me.pixelsPerLonDegree_;
        var exct = 0.0818197;
        var z = Math.sin(latLng.lat()/180*Math.PI);
        point.y = Math.abs(origin.y - me.pixelsPerLonRadian_*(atanh(z)-exct*atanh(exct*z)));
        return point;
     };

    YandexProjection.prototype.fromPointToLatLng = function(point) {
        var me = this;
        var origin = me.pixelOrigin_;
        var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
        var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
        var lat = Math.abs((2*Math.atan(Math.exp(latRadians))-Math.PI/2)*180/Math.PI);
        var Zu = lat/(180/Math.PI);
        var Zum1 = Zu+1;
        var exct = 0.0818197;
        var yy = -Math.abs(((point.y)-128));
        while (Math.abs(Zum1-Zu)>0.0000001){
            Zum1 = Zu;
            Zu = Math.asin(1-((1+Math.sin(Zum1))*Math.pow(1-exct*Math.sin(Zum1),exct)) /
                (Math.exp((2*yy)/-(256/(2*Math.PI)))*Math.pow(1+exct*Math.sin(Zum1),exct)));
        }
        if (point.y>256/2) {lat=-Zu*180/Math.PI;}
        else {lat=Zu*180/Math.PI;}
        return new google.maps.LatLng(lat, lng);
     };

    /*

    Тайлы с яндекса:

    http://vec01.maps.yandex.net/tiles?l=map&v=2.26.0&x=33&y=23&z=6&lang=ru-RU
    http://sat02.maps.yandex.net/tiles?l=sat&v=1.33.0&x=9774&y=5675&z=14&lang=ru-RU
    http://02.pvec.maps.yandex.net/?l=pmap&x=306&y=177&z=9&lang=ru-RU&v=1331236800

    */


    var yandexMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            //return "http://vec0"+((coord.x+coord.y)%5)+".maps.yandex.net/tiles?l=map&v=2.16.0&x=" + coord.x + "&y=" + coord.y + "&z=" + zoom + "";
            return 'http://vec0'+((coord.x+coord.y)%5)+'.maps.yandex.net/tiles?l=map&v=2.26.0&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom + '&lang=ru-RU';
            //return "http://sat0'+((coord.x+coord.y)%5)+'.maps.yandex.net/tiles?l=sat&v=1.33.0&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom + '&lang=ru-RU';
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        alt: 'Яндекс карта',
        name: 'Яндекс',
        maxZoom: 17,
        minZoom:0
        //, opacity:0.9
    });
    yandexMapType.projection = new YandexProjection();

    var yandexSatType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            //return 'http://vec0'+((coord.x+coord.y)%5)+'.maps.yandex.net/tiles?l=map&v=2.16.0&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom + '';
            //return 'http://vec0'+((coord.x+coord.y)%5)+'.maps.yandex.net/tiles?l=map&v=2.26.0&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom + '&lang=ru-RU';
            return 'http://sat0'+((coord.x+coord.y)%5)+'.maps.yandex.net/tiles?l=sat&v=1.33.0&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom + '&lang=ru-RU';
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        alt: 'Яндекс спутник',
        name: 'Яспутник',
        maxZoom: 17,
        minZoom:0
        //, opacity:0.9
    });
    yandexSatType.projection = new YandexProjection();

    var yandexPipType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return 'http://0'+((coord.x+coord.y)%5)+'.pvec.maps.yandex.net/?l=pmap&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom + '&lang=ru-RU';
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        alt: 'Яндекс народная',
        name: 'Янарод',
        maxZoom: 17,
        minZoom:0
        //, opacity:0.9
    });
    yandexPipType.projection = new YandexProjection();

    var gis2Type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return 'http://tile'+((coord.x+coord.y)%5)+'.maps.2gis.ru/tiles?x=' + coord.x + '&y=' + coord.y + '&z=' + zoom;
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        alt: '2Gis',
        name: '2Gis',
        maxZoom: 13,
        minZoom:0
        //, opacity:0.5
    });
    //gis2Type.projection = new YandexProjection();

    var WikimapiaType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            return 'http://i'+ ((coord.x%4) + (coord.y%4) * 4) +'.wikimapia.org/?x=' + coord.x + '&y='+ coord.y +'&zoom='+ zoom +'&r=0&type=&lng=0';
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        alt: 'Wikimapia',
        name: 'Wikimapia',
        maxZoom: 17,        // (22) TODO: Временная борьба с тормозами на большом зуме
        minZoom:0
        //, opacity:0.5
    });
    //gis2Type.projection = new YandexProjection();

    var VisicomType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            var y = Math.pow(2, zoom) - 1 - coord.y;
            return 'http://tms'+ ((coord.x+coord.y)%4) +'.visicom.ua/1.0.3/world_ru/'+ zoom +'/'+ coord.x +'/'+ y +'.png';
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
        alt: 'Visicom',
        name: 'Visicom',
        maxZoom: 17,        // (18) TODO: Временная борьба с тормозами на большом зуме
        minZoom:0
        //, opacity:0.5
    });
    //VisicomType.projection = new YandexProjection();


// Enable the visual refresh
if (google && google.maps) {
    google.maps.visualRefresh = true;
}

angular.module('directives.gmap', ['services.connect', 'services.eventmarker', 'services.lastmarker', 'services.pointmarker', 'services.userDataStorage'/*, 'ui'*/ ])

.directive('gmap', ['Connect', 'EventMarker', 'LastMarker', 'PointMarker', 'GeoGPS',
    function(Connect, EventMarker, LastMarker, PointMarker, GeoGPS) {
        // 'use strict';
        
        // TODO! Необходима унификация для поддержки как минимум Google Maps и Leaflet

        var link = function(scope, element) {
            var path = null,
                select = null,
                gmarker = null;
            var speedLimitsPath = [];
            var fragments = [];
            var clearSpeedLimits = function() {
                for(var i = 0, il = speedLimitsPath.length; i < il; i++) {
                    speedLimitsPath[i].setMap(null);   
                }
                speedLimitsPath.length = 0;
            };
            
            
            var toggleEnableSpeedLimit = function(enable) {
                if (enable) {
                    for (var i = 0, il = fragments.length; i < il; i++) {
                        speedLimitsPath.push(new google.maps.Polyline({
                            path: fragments[i],
                            strokeColor: 'red',
                            strokeOpacity: 0.9,
                            strokeWeight: 2.5,
                            clickable: false,
                            // editable: true,
                            map: scope.map
                        }));
                    }
                } else {
                    clearSpeedLimits();
                }
            };
            
            

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

            var mapTypeIds = [];
            for(var type in google.maps.MapTypeId) {
                //if(google.maps.MapTypeId[type].maxZoom > 17) {
                //  google.maps.MapTypeId[type].maxZoom = 17;
                //}
                mapTypeIds.push(google.maps.MapTypeId[type]);
            }
            mapTypeIds.push('Apple');
            mapTypeIds.push('OSM');
            mapTypeIds.push('YMAP');
            mapTypeIds.push('YSAT');
            mapTypeIds.push('YPIP');
    //      mapTypeIds.push('GISMO');
            mapTypeIds.push('OVIMAP');
            mapTypeIds.push('OVISAT');
            mapTypeIds.push('2GIS');
            mapTypeIds.push('Wikimapia');
            mapTypeIds.push('Visicom');
            //mapTypeIds.push('Google');
            // mapTypeIds.push('Quest');

            // Для установки максимального зума для целей отладки нужно выполнить в консоли: localStorage.setItem('map.maxZoom', 30)
            var maxZoom = (window.localStorage.getItem('map.maxZoom') || '20') | 0; //TODO: window.localStorage.getItem('map.maxZoom') значение пустое и всегда возвращает значение по умолчанию а 16 мало для гугловских карт

            // var latlng = new google.maps.LatLng(48.397, 34.644);
            var myOptions = {
                center: new google.maps.LatLng(prev_config.center[0], prev_config.center[1]),
                mapTypeId: prev_config.typeId,
                mapTypeControlOptions: {
                    mapTypeIds: mapTypeIds,
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                },
                scaleControl: true,
                maxZoom: maxZoom,
                draggableCursor: 'pointer',
                zoom: prev_config.zoom
            };


            var map_element = element.find('.gmap-container');
            // console.log('map_element=', map_element);
            var map = new google.maps.Map(map_element[0], myOptions);

            // console.log('scope=', scope);
            // scope.gmap(map);
            scope.map = map;

            // Не самое элегантное решение
            map.customInfoWindow = new google.maps.InfoWindow({
                clickable: false    // Кажется это не работает
            });

            map.mapTypes.set('Apple', new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    //return 'http://gsp2.apple.com/tile?api=1&style=slideshow&layers=default&lang=de_DE&z=' + zoom + '&x=' + coord.x + '&y=' + coord.y + '&v=9';
                    return 'http://gsp2.apple.com/tile?api=1&style=slideshow&layers=default&lang=en_EN&z=' + zoom + '&x=' + coord.x + '&y=' + coord.y + '&v=9';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'Apple',
                minZoom: 3,
                maxZoom: 14
            }));

            map.mapTypes.set('OSM', new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    return 'http://tile.openstreetmap.org/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                    // ((coord.x+coord.y)%5)
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'OpenStreetMap',
                maxZoom: 17     // (18) TODO: Временная борьба с тормозами на большом зуме
            }));

            map.mapTypes.set('OVIMAP', new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    //return 'http://tile.openstreetmap.org/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                    return 'http://c.maptile.maps.svc.ovi.com/maptiler/v2/maptile/newest/normal.day/' + zoom + '/' + coord.x + '/' + coord.y + '/256/png8';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'Ovi карта',
                maxZoom: 17
            }));

            map.mapTypes.set('OVISAT', new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    //return 'http://tile.openstreetmap.org/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
                    return 'http://b.maptile.maps.svc.ovi.com/maptiler/v2/maptile/newest/satellite.day/' + zoom + '/' + coord.x + '/' + coord.y + '/256/png8';
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'Ovi спутник',
                maxZoom: 17
            }));

            map.mapTypes.set('Google', new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    //return 'http://mt.google.com/vt/hl=en&src=app&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom;
                    return 'http://mt.google.com/vt/hl=ru&src=app&x=' + coord.x + '&y=' + coord.y + '&z=' + zoom;
                },
                tileSize: new google.maps.Size(256, 256),
                name: 'Google',
                maxZoom: 17
            }));

            map.mapTypes.set('YMAP', yandexMapType);
            map.mapTypes.set('YSAT', yandexSatType);
            map.mapTypes.set('YPIP', yandexPipType);
            map.mapTypes.set('2GIS', gis2Type);
            map.mapTypes.set('Wikimapia', WikimapiaType);
            map.mapTypes.set('Visicom', VisicomType);
            // map.mapTypes.set('Quest', QuestType);
            //map.mapTypes.set('GISMO', GisMapType);



            var saveMapState = function() {
                window.localStorage.setItem('map.config', JSON.stringify({
                    center: [map.getCenter().lat(), map.getCenter().lng()],
                    zoom: map.getZoom(),
                    typeId: map.getMapTypeId()
                }));
            };

            google.maps.event.addListener(map, 'idle', saveMapState);
            google.maps.event.addListener(map, 'maptypeid_changed', saveMapState);

            // var findZoneBound = new google.maps.LatLngBounds(
            //     new google.maps.LatLng(moev.latLng.lat() - size*clat, moev.latLng.lng() - size ),
            //     new google.maps.LatLng(moev.latLng.lat() + size*clat, moev.latLng.lng() + size )
            // );
            google.maps.event.addListener(map, 'mousemove', function(ev){mouseMove(ev);});
            // google.maps.event.addListener(map, 'click', function(){pointmarkers.hideInfo();});

            var checkZoomLevel = function (_map) {
                var zoomLevel = _map.getZoom();
                if (zoomLevel > 17) {
                    scope.showMapAlert ();
                } else {
                    scope.hideMapAlert ();   
                }
            };
            google.maps.event.addListener(map, 'zoom_changed', function() {
                checkZoomLevel (map);
                /*var zoomLevel = map.getZoom();
                if (zoomLevel > 17) {
                    console.log(zoomLevel);
                    var saved = window.localStorage.getItem('mapZoomAlert');
                    if (!saved) {
                        window.localStorage.setItem('mapZoomAlert', true);
                        alert("Из-за особенностей работы gps нельзя гарантировать точность отображения точек трэка при большем приближении");
                    }
                }*/
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

            // var updatePoints = function(points) {
            //     scope.points = points;
            // };

            scope.findNearestPoint = function(M) {
                if (scope.points.length === 0)
                    return null;
                var points = scope.points;
                var point = null;
                var minDistance = 1000000000;
                //console.log(scope);
                for (var i = 0; i < points.length; ++i) {
                    var distance = GeoGPS.distance(points[i], M);
                    if (minDistance > distance) {
                        point = points[i];
                        minDistance = distance;
                    }
                }
                return point;
            };

            // scope.infowindow = new google.maps.InfoWindow();

            var pointmarkers = new PointMarker(map);

            var quadtree;
            // var findZone = new google.maps.Rectangle({
            //     // bounds: bound,
            //     clickable: false,
            //     map: map,
            //     fillColor: '#00FFFF',
            //     fillOpacity: 0.1,
            //     strokeColor: '#00FFFF',
            //     strokeOpacity: 1.0,
            //     strokeWeight: 1
            // });

            var mouseMove = function(event){

                if ((!scope.track) || (scope.track.points.length === 0 )) return null;

                var point = {lat: event.latLng.lat(), lon: event.latLng.lng()};
                // console.log('mousemove', event);

                var size = 0.0005;
                var scale = Math.sqrt(2);
                var nearestpoint;

                for(var i=0; i<8; i++, size*=scale){
                    nearestpoint = GeoGPS.findInQuadtree(quadtree, point, size);
                    if(nearestpoint.length > 2) break;
                }
                var clat = Math.cos(event.latLng.lat() * Math.PI / 180);
                if(clat < 0.0001) clat = 0.0001;

                // var bound;
                // if(nearestpoint.length > 0) {
                //     bound = new google.maps.LatLngBounds(
                //         new google.maps.LatLng(event.latLng.lat() - size*clat, event.latLng.lng() - size ),
                //         new google.maps.LatLng(event.latLng.lat() + size*clat, event.latLng.lng() + size )
                //     );
                // } else {
                //     bound = new google.maps.LatLngBounds(
                //         new google.maps.LatLng(event.latLng.lat(), event.latLng.lng() ),
                //         new google.maps.LatLng(event.latLng.lat(), event.latLng.lng() )
                //     );
                // }
                // findZone.setBounds(bound);

                pointmarkers.setData(nearestpoint);
            };

            var showTrack = function(data) {
                // if (scope.infowindow !== null)
                //     scope.infowindow.close();
                // updatePoints(data.points);
                pointmarkers.hideInfo();
                if (!data) {
                    eventmarker.setData([]);
                    return;
                }

                quadtree = GeoGPS.initQuadtree(data.points);
                // console.dir(quadtree);

                path = new google.maps.Polyline({
                    path: data.track,
                    strokeColor: 'blue',
                    strokeOpacity: 0.5, //data.select ? 0.7 : 0.5,
                    strokeWeight: data.select ? 2 : 5,
                    clickable: false,
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
                    if (data.select.type !== 'MOVE') {
                        map.setZoom(17);
                    }

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
                    if (scope.config.autobounds && !data.update) {
                        map.fitBounds(data.bounds);
                    }
                }
                fragments.length = 0;
                var speedLimit = 65;
                if (scope.config.speedLimitValue > 0)
                    speedLimit = scope.config.speedLimitValue;
                var startIndex = null;
                for (var i = 0, il = data.points.length; i < il; i++) {
                    var item = data.points[i];
                    if (item.speed > speedLimit) {
                        if (startIndex === null)
                            startIndex = i;
                    } else if (startIndex !== null) {
                        fragments.push(data.track.slice(startIndex, i));
                        startIndex = null;
                    }
                }
                if (startIndex !== null)
                    fragments.push(data.track.slice(startIndex, data.track.length - 1));
                toggleEnableSpeedLimit(scope.config.enableSpeedLimit);
                if (map.zoom > 17) {
                        map.setZoom(17);
                    }
                eventmarker.setData(data.events);
            };
            
            var setTrack = function (data) {
                clearSpeedLimits();
                if (path) {
                    path.setMap(null);
                    path = null;
                    eventmarker.setData([]);
                }
                if (!data || (data.points.length === 0)) {
                    if (select) {
                        select.setPath([]);
                    }
                    pointmarkers.hideInfo();
                    pointmarkers.setData ([]);
                    return;
                }
                showTrack(data);
                checkZoomLevel (map);
            };
            
             scope.$on('setTrack', function(event, data) { 
                 setTrack (data);
             });

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
            
            scope.$watch('config.enableSpeedLimit', function() {
               toggleEnableSpeedLimit(scope.config.enableSpeedLimit); 
            });

            scope.$watch('systems', function() {
                updateLastMarkers();
            }, true);


            scope.$watch('sfilter', function(){
                updateLastMarkers();
            });

            scope.hideTrack = function(){
                // console.log('gmap:hideTrack');

                //scope.track.track = [];
                //scope.track.points = [];
                //scope.track.ranges = [];
                setTrack (null);
                scope.onHide();

                // $scope.track.track = [];
                // $scope.track.points = [];
                // $scope.track.ranges = [];
            };
            // '<div class='map-search'>'
            //     '<div class='input-group'>'
            //         '<span class='input-group-addon'><i class='icon-search icon-large'></i></span>'
            //         '<input type='text' class='form-control' google-maps-search='bounds'>'
            //     '</div>'
            // '</div>'
            localStorage.setItem('notShowMapAlert', false);
            scope.doNotShowMapAlert = function () {
                localStorage.setItem('notShowMapAlert', true);
            };
            scope.mapAlertIsShow = false;
            scope.hideMapAlert = function () {
                safeApply(scope,function(){
                    scope.mapAlertIsShow = false;
                });
            };
            scope.showMapAlert = function () {
                var notShowMapAlert = localStorage.getItem('notShowMapAlert');
                if (notShowMapAlert !== 'true') {
                    safeApply(scope,function(){
                        scope.mapAlertIsShow = true;
                    });
                }
            };
            checkZoomLevel (map);
        };
        
        var safeApply = function(scope,fn) {
          var phase = scope.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            scope.$apply(fn);
          }
        };

        return {
            restrict: 'E',
            transclude: false,
            template:
                '<div class="gmap">'+
                    '<div class="gmap-container"></div>'+
                    '<gmap-search map="map"></gmap-search>'+
                    '<map-alert is-show="mapAlertIsShow" do-not-show="doNotShowMapAlert()"></map-alert>'+
                    '<gmap-tool-bar map="map" config="config" on-hide="hideTrack()"></gmap-tool-bar>'+
                '</div>',
            replace: true,
            scope: {
                track:   '=',
                config:  '=',
                center:  '=',
                account: '=',
                systems: '=',
                delegat: '=',
                onHide: '&',
                sfilter: '=sfilter'
            },
            link: link
        };
    }
])

.directive('gmapToolBar', ['userDataStorage',
    function(userDataStorage) {
        // 'use strict';

        var link = function(scope) {
            // console.log('gmapToolBar:link', scope);

            scope.showconfig = false;
            // грязный хак!!!!! (что бы исправить багу в некоторых браузерах. Модальное окно находится под затемнялкой)
            $('#changeMapParamsModal').on('shown.bs.modal', function (e) {
                var $fade = $('.modal-backdrop.fade.in');
                $fade.remove();
                var $this = $(this);
                var $parent = $this.parent();
                //$this.remove();
                $parent.append($fade);
                $parent.append($this);
            });
            scope.showMapParams = function() {
                $('#changeMapParamsModal').modal({keyboard: true, show: true});
            };

            scope.$watch('config.numbers', function() {
                if (scope.config.numbers) {
                    $('.eventmarker .track.STOP .eventmarker-nonumber').attr('style', '');
                    $('.eventmarker .track.STOP .eventmarker-number').attr('style', 'display: initial');
                } else {
                    $('.eventmarker .track.STOP .eventmarker-nonumber').attr('style', 'display: initial');
                    $('.eventmarker .track.STOP .eventmarker-number').attr('style', 'display: none');
                }
            });
            scope.$watch('config.enableSpeedLimit', function() {
                userDataStorage.setItem('enableSpeedLimit', scope.config.enableSpeedLimit);
            });
            scope.$watch('config.speedLimitValue', function() {
                userDataStorage.setItem('speedLimitValue', scope.config.speedLimitValue);
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
        // 'use strict';

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
                // var leg = currentDirections.routes[0].legs[0]; // ??? FTF?
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
    // 'use strict';
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
                    element.removeClass('hidden');
                } else {
                    if (item === null) {
                        element.addClass('hidden');
                    }
                    element.addClass('off');
                    element.removeClass('on');
                }
            });
        }
    };
})

.directive('mapAlert', [
    function() {
        // 'use strict';
        var link = function(scope, element) {
            //console.log('mapAlert:link', scope);
            scope.close = function () {
                scope.isShow = false;
            };
            scope.notShow = function () {
                scope.close ();
                scope.doNotShow ();
            };
        };
        return {
            restrict: 'EA',
            // require: '^gmap',
            transclude: true,
            template: '<div ng-show="isShow" class="map-alert"><div class="map-alert-body"><i class="map-alert-close-button icon-remove" ng-click="notShow()"></i><div class="map-alert-message" translate>Из-за особенностей работы гражданской GPS, при большом масштабе увеличиваются погрешности отображения треков.</div><div style="clear:both;"></div></div></div>',
            //<div class="map-alert-doNotShow-button"><button ng-click="notShow()" class="btn" translate>Больше не показывать</button></div></div>',
            replace: true,
            scope: {
                isShow: '=',
                doNotShow: '&'
            },
            link: link
        };
    }
]);

})();
