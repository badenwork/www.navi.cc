// Enable the visual refresh
google.maps.visualRefresh = true;

angular.module('directives.gmap', ['services.connect', 'services.eventmarker', 'services.lastmarker'/*, 'ui'*/])

.directive('gmap', ["Connect", "EventMarker", "LastMarker", function(Connect, EventMarker, LastMarker) {

    // TODO! Необходима унификация для поддержки как минимум Google Maps и Leaflet

    var link = function(scope, element, attrs) {
        var path = null,
            select = null;
        var gmarker = null;
        // console.log('map directive: link', scope, element, Connect);
        //element.innerHTML="<div>map</div>";

        // Временное решение для доступа к главной карте
        //window["config"] = {};
        // var config = window["config"] = {};

        var prev_config = localStorage.getItem('map.config');
        if(prev_config){
            prev_config = JSON.parse(prev_config);
        } else {
            prev_config = {
                zoom: 6,
                center: [48.370848, 32.717285],
                typeId: google.maps.MapTypeId.ROADMAP
            };
        }

        var latlng = new google.maps.LatLng(48.397, 34.644);
        var myOptions = {
            center: new google.maps.LatLng(prev_config.center[0], prev_config.center[1]),
            mapTypeId: prev_config.typeId,
            zoom: prev_config.zoom
        };
        var map = new google.maps.Map(element[0], myOptions);

        // config.map = map;

        var saveMapState = function() {
            localStorage.setItem('map.config', JSON.stringify({
                center: [map.getCenter().lat(), map.getCenter().lng()],
                zoom: map.getZoom(),
                typeId: map.getMapTypeId()
            }));
        };

        google.maps.event.addListener(map, 'idle', saveMapState);
        google.maps.event.addListener(map, 'maptypeid_changed', saveMapState);

        google.maps.event.addListener(map, 'zoom_changed', function(){
            // console.log('zoom_changed');
            //PathRebuild();
        });

          if(scope.config.centermarker){
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
        scope.$watch("center", function(center){
            if(center) {
                var pos = new google.maps.LatLng(center.lat, center.lon);
                map.panTo(pos);
                if(scope.config.centermarker){
                    gmarker.setPosition(pos);
                }
            }
        });

        var eventmarker = new EventMarker(map);

        var eventmarkers = {};

//        if(scope.config.autobounds){
        function animateCircle() {
            var count = 0;
            offsetId = window.setInterval(function() {
                if(path === null) return;                // FIXME: Не самое элегантное решение
                if(!scope.config.animation) return;     // FIXME: Не самое элегантное решение

                count = (count + 1) % 50;

                var icons = path.get('icons');
                icons[0].offset = (count*2) + 'px';
                path.set('icons', icons);
          }, 250);
        }
        animateCircle();
        
        scope.points = [];
        
        var updatePoints = function(points) {
            scope.points = points;
        }
        scope.distance = function (p1, p2) {
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
        scope.findNearestPoint = function(M) {
                if (scope.points.length == 0)
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
            }
        scope.infowindow = new google.maps.InfoWindow();

        var showTrack = function(data){

            // console.log("showTrack", data);
            updatePoints (data.points);
            console.log("ShowTrack");
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
            

            google.maps.event.addListener(path, 'click', function(event)
            {
                //console.log(event);
                var point = scope.findNearestPoint({lat:event.latLng.lb, lon:event.latLng.mb});
                console.log(point);
                if (scope.infowindow != null)
                    scope.infowindow.close();
                scope.infowindow.content = "gegethteh";
                scope.infowindow.position = event.latLng;//new google.maps.LatLng(point.lat, point.lon)
                scope.infowindow.open(map);
            });


            if(data.select){
                var start = data.select.start_index;
                var stop = data.select.stop_index;
                if(data.select.type === "MOVE") {
                    start = Math.max(0, start-1);
                    stop = Math.min(data.track.length-1, stop+1);
                }
                var fragment = data.track.slice(start, stop);
                var bounds = new google.maps.LatLngBounds(fragment[0], fragment[0]);

                fragment.forEach(function(point){bounds.extend(point)});
                // console.log("bounds=", bounds);
                map.fitBounds(bounds);

                if(select) {
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
                if(select) {
                    select.setPath([]);
                }
                // console.log("scope.autobounds=", scope.autobounds);
                if(scope.config.autobounds){
                    map.fitBounds(data.bounds);
                }
            }

            var eventdata = [];
            var index = 1;
            for(i=0; i<data.events.length; i++){
                var e = data.events[i];
                var title = "?";
                if(e.type === "START"){
                    title = "S";
                } else if(e.type === "FINISH"){
                    title =  "F";
                } else {
                    title = "" + index;
                    index += 1;
                }
                eventdata.push({
                    title: title,
                    type: e.type,
                    pos: e.position,
                    point: e.point
                });
            }

            eventmarker.setData(eventdata);

        };

        // TODO. Не нравится мне чтото это. Заменить бып на событие.
        scope.$watch("track", function(data){
            // console.log(['MAP:track change', data]);
            // $scope.hideTrack();
            if(path) {
                path.setMap(null);
                path = null;
                eventmarker.setData([]);
            }
            if((data === null) || (data.points.length === 0) ) return; 
            showTrack(data);
        }, true);
        // scope.$watch("track.select", function(data){
        //     console.log(['MAP:track select', data]);
        // });

        var lastmarker = new LastMarker(map);

        scope.$watch("systems", function(systems){
            if(!systems) return;
            var lastpos = [];
            //for(var i in systems){}
            angular.forEach(systems, function(sys){
                if(sys.dynamic && sys.dynamic.latitude){
                    // console.log('forEach ', sys, key);
                    var off = scope.account.account.off;
                    if(!off.hasOwnProperty(sys.id)) {
                          lastpos.push({
                            key: sys.id,
                            title: sys.title,
                            icon: sys.icon,
                            dynamic: sys.dynamic,
                            hasFuelSensor: sys.car.hasFuelSensor
                        })
                    }
                }
            });
            lastmarker.setData(lastpos);
            // console.log('$watch account.account.systems', systems, lastpos);
        }, true);


    };

    return {
        restrict: 'A',
        transclude: false,
        //scope: {last_pos: '='},
        //template: '<div>List:<ul><li ng-repeat="l in list">{{l}}<i class="icon-arrow-right"></i><span>{{l}}</span></li></ul></div>',
        //template: '<div>MAP</div>',
        scope: {
            track: "=",
            config: "=",
            center: "=",
            account: "=",
            systems: "="
        },
        link: link/*,
        controller: ["$scope", "Connect", function($scope, Connect){
            console.log("map directive:controller", $scope, Connect);
        }]*/
    };
}]);

/*
<div style="cursor: default; width: 264px; height: 178px; position: absolute; left: 576px; top: 284px; z-index: 284;"><div style="position: absolute; left: 0px; top: 0px;"><div style="width: 0px; height: 0px; border-right-width: 10px; border-right-style: solid; border-right-color: transparent; border-left-width: 10px; border-left-style: solid; border-left-color: transparent; border-top-width: 24px; border-top-style: solid; border-top-color: rgba(0, 0, 0, 0.0980392); position: absolute; left: 122px; top: 178px;"></div><div style="position: absolute; left: 0px; top: 0px; background-color: rgba(0, 0, 0, 0.2); border-top-left-radius: 2px; border-top-right-radius: 2px; border-bottom-right-radius: 2px; border-bottom-left-radius: 2px; -webkit-box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px; box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px; width: 264px; height: 178px;"></div><div style="border-top-width: 24px; position: absolute; left: 122px; top: 175px;"><div style="position: absolute; overflow: hidden; left: -6px; top: -1px; width: 16px; height: 30px;"><div style="position: absolute; left: 6px; background-color: rgb(255, 255, 255); -webkit-transform: skewX(22.6deg); -webkit-transform-origin: 0px 0px; height: 24px; width: 10px; box-shadow: rgba(0, 0, 0, 0.6) 0px 1px 6px;"></div></div><div style="position: absolute; overflow: hidden; top: -1px; left: 10px; width: 16px; height: 30px;"><div style="position: absolute; left: 0px; background-color: rgb(255, 255, 255); -webkit-transform: skewX(-22.6deg); -webkit-transform-origin: 10px 0px; height: 24px; width: 10px; box-shadow: rgba(0, 0, 0, 0.6) 0px 1px 6px;"></div></div></div><div style="position: absolute; left: 1px; top: 1px; border-top-left-radius: 2px; border-top-right-radius: 2px; border-bottom-right-radius: 2px; border-bottom-left-radius: 2px; background-color: rgb(255, 255, 255); width: 262px; height: 176px;"></div></div><div class="gm-style-iw" style="position: absolute; left: 12px; top: 9px; overflow: auto; width: 220px; height: 160px;"><div class="" style="overflow: auto;"><div style="width: 220px; height: 160px; border: none;"><div class="info-header">11/10/2013 8:19:36</div><table id="tbl_info" width="100%"><tbody><tr><td>Направление:</td><td><b>245°</b></td></tr><tr><td>Долгота:</td><td><b>48.40672</b></td></tr><tr><td>Широта:</td><td><b>35.04784</b></td></tr><tr><td>Спутники</td><td><b>8</b></td></tr><tr><td>Скорость</td><td><b>36.6км/ч</b></td></tr><tr><td>Основное питание</td><td><b>13.8В</b></td></tr><tr><td>Резервное питание</td><td><b>4.21В</b></td></tr><tr><td>Тип метки</td><td><b>ANGLE</b></td></tr></tbody></table><div id="moreinfo" title="Ожидайте, идет получение дополнительной информации."></div></div></div></div><div style="width: 13px; height: 13px; overflow: hidden; position: absolute; opacity: 0.7; right: 12px; top: 12px; z-index: 10000; cursor: pointer;"><img src="http://maps.gstatic.com/mapfiles/api-3/images/mapcnt3.png" draggable="false" style="position: absolute; left: -2px; top: -336px; width: 59px; height: 492px; -webkit-user-select: none; border: 0px; padding: 0px; margin: 0px;"></div></div>

*/
