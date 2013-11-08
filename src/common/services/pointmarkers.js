/* global angular:true, google:true, d3:true, moment:true */

/*
    Маркеры последних известных положений ТС.
*/

angular.module('services.pointmarker', ['newgps.services'])

.factory('PointMarker', [
    function() {
        'use strict';

        function PointMarker(map) {
            this.map = map;
            this.div = null;
            this.data = [];
            this.setMap(map);
            this.infowindow = new google.maps.InfoWindow({
                clickable: false
            });
        }

        PointMarker.prototype = new google.maps.OverlayView();

        // var SVG = {};
        // SVG.ns = 'http://www.w3.org/2000/svg';
        // SVG.xlinkns = 'http://www.w3.org/1999/xlink';

        PointMarker.prototype.onAdd = function() {
            var div = this.div = document.createElement('div');

            div.setAttribute('class', 'pointmarker');

            div.marker = this;
            var panes = this.getPanes();
            this.panes = panes;

            panes.overlayImage.appendChild(div);
        };

        PointMarker.prototype.setData = function(data) {
            this.data = data;
            this.draw();
        };

        PointMarker.prototype.onRemove = function() {
            if (this.infowindow !== null)
                this.infowindow.close();
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        };

        PointMarker.prototype.hideInfo = function() {
            if (this.infowindow !== null)
                this.infowindow.close();
        };

        PointMarker.prototype.draw = function() {
            var overlayProjection = this.getProjection();
            var that = this;

            if (!overlayProjection) return;

            // var div = this.div;

            var track = d3.select(this.div);
            var points = track.selectAll('.marker')
                .data(this.data);

            ///////////////////////
            // Создание. Тут можно особо не заполнять данными, лишь бы структуру создать, ниже все равно будет обновление.
            ///////////////////////

            /*var div =*/ points.enter().append('div')
                .attr('class', 'marker')
                .on('click', function(point) {
                    // window.console.log('TODO', d3.select(this), d);
                    var timeStr = moment(new Date((point.dt * 1000))).format('DD/MM/YYYY : HH:mm');
                    var lat = Math.round(point.lat * 100000) / 100000;
                    var lon = Math.round(point.lon * 100000) / 100000;
                    var sats = point.sats;
                    var speed = Math.round(point.speed * 10) / 10;
                    var vin = Math.round(point.vin * 100) / 100;
                    var vout = Math.round(point.vout * 100) / 100;
                    var content = '<div class="info-header">' + timeStr + '</div><table id="tbl_info" width="100%"><tbody><tr><td>Долгота:</td><td><b>' + lat + '</b></td></tr><tr><td>Широта:</td><td><b>' + lon + '</b></td></tr><tr><td>Спутники</td><td><b>' + sats + '</b></td></tr><tr><td>Скорость</td><td><b>' + speed + 'км/ч</b></td></tr><tr><td>Основное питание</td><td><b>' + vout + 'В</b></td></tr><tr><td>Резервное питание</td><td><b>' + vin + 'В</b></td></tr></tbody></table>';
                    that.infowindow.setContent(content);
                    that.infowindow.setPosition(new google.maps.LatLng(point.lat, point.lon));
                    that.infowindow.open(that.map);

                // })
                // .on('mouseenter', function(point) {
                //     console.log('enter');
                // })
                // .on('mouseover', function(point) {
                //     console.log('over');
                // })
                // .on('mouseleave', function(point) {
                //     console.log('leave');
                //     // if (that.infowindow !== null)
                //     //     that.infowindow.close();
                });

            ///////////////////////
            // Обновление
            ///////////////////////

            points
                .attr('style', function(d) {
                    var px = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(d.lat, d.lon));
                    return 'left: ' + (px.x) + 'px; top: ' + (px.y) + 'px' + (d.hidden?';display: none':'');
                });

            ///////////////////////
            // Удаление лишних
            ///////////////////////

            points.exit().remove();
        };

        return PointMarker;
    }
]);
