/*
    Маркеры последних известных положений ТС.
*/

angular.module('services.lastmarker', ['newgps.services'])

.factory('LastMarker', [
    "$freshmark",
    "$filter",
    function($freshmark, $filter) {
        function LastMarker(map) {
            this.map = map;
            this.div = null;
            this.data = [];
            this.setMap(map);
        }

        LastMarker.prototype = new google.maps.OverlayView();

        var SVG = {};
        SVG.ns = "http://www.w3.org/2000/svg";
        SVG.xlinkns = "http://www.w3.org/1999/xlink";

        LastMarker.prototype.onAdd = function() {
            var div = this.div = document.createElement('div');

            div.setAttribute("class", "lastmarker");

            div.marker = this;
            var panes = this.getPanes();
            this.panes = panes;

            panes.overlayImage.appendChild(div);
        }

        LastMarker.prototype.setData = function(data) {
            this.data = data;
            this.draw();
        }

        LastMarker.prototype.onRemove = function() {
            this.div.parentNode.removeChild(this.div);
            this.arrdiv = null;
            this.div = null;
        }

        var sysTitle = function(sys) {
            return sys.title;
        };

        var sysTime = function(sys) {
            if (sys && sys.dynamic) {
                return moment((new Date((sys.dynamic.dt * 1000)))).format("DD/MM/YYYY : hh:mm");
            } else {
                return '-';
            }
        };

        var sysSpeed = function(sys) {
            if (sys && sys.dynamic) {
                return Math.round(sys.dynamic.speed * 10) / 10;
            } else {
                return '-';
            }
        };

        var sysVout = function(sys) {
            if (sys && sys.dynamic) {
                return Math.round(sys.dynamic.vout * 100) / 100;
            } else {
                return '-';
            }
        };

        var sysVin = function(sys) {
            if (sys && sys.dynamic) {
                return Math.round(sys.dynamic.vin * 100)/100;
            } else {
                return '-';
            }
        };

        var sysSats = function(sys) {
            if (sys && sys.dynamic) {
                return sys.dynamic.sats;
            } else {
                return '-';
            }
        };

        var sysFuel = function(sys) {
            if (sys && sys.dynamic){
                return $filter('number')(sys.dynamic.fuel, 1);
            } else {
                return '-';
            }
        };

        LastMarker.prototype.draw = function() {
            var overlayProjection = this.getProjection();

            if (!overlayProjection) return;

            var div = this.div;

            var track = d3.select(this.div);
            var points = track.selectAll(".marker")
                .data(this.data);

            ///////////////////////
            // Создание. Тут можно особо не заполнять данными, лишь бы структуру создать, ниже все равно будет обновление.
            ///////////////////////

            var div = points.enter().append("div")
                .attr("class", "marker")
                .on('click', function(d) {
                    console.log("TODO", d3.select(this), d);
                });
                // oO жестяк!!! через CSS это делается намного проще (см map.less)
                // .on('mouseout', function(e){
                //     var lastM = document.getElementById('lastmarkerID_' + e.key);
                //     lastM.setAttribute('class','hide');
                // })
                // .on('mouseover', function(e){
                //     var lastM = document.getElementById('lastmarkerID_' + e.key);
                //     lastM.setAttribute('class','');
                // });

            div.append("i");
            var label = div.append("span")
                .attr("class", "label");

            label.append("span")
                    .attr("class", "title");

            var tbody = label.append('div')
                .attr("class", "lastmarker-control")
                    .append('table')
                        .append('tbody');

            var controlline = function(classname, title){
                return function() {
                    this.attr('class', classname);
                    this.append('td').text(title);
                    this.append('td').text("TBD");
                }
            }

            tbody.append('tr').call(controlline('lastmarkerTime',  'Время'));        // TODO: ngTranslate
            tbody.append('tr').call(controlline('lastmarkerSpeed', 'Скорость'));
            tbody.append('tr').call(controlline('lastmarkerVout',  'Осн.питание'));
            tbody.append('tr').call(controlline('lastmarkerVin',   'Рез.питание'));
            tbody.append('tr').call(controlline('lastmarkerSats',  'Спутники'));
            tbody.append('tr').call(controlline('lastmarkerFuel',  'Топливо'))
                .attr('style', function(d){return d.hasFuelSensor ? "" : "display: none"});

            div.append("svg")
                .attr("style", 'position:absolute; left: -5px; top: -5px')
                .attr("width", 32)
                .attr("height", 32)
                .append("g")
                    .attr("transform", "translate(16, 16)")
                    .append('path')
                        .attr("d", "M -9,-10 0,-15 9,-10 0,-13 -9,-10")
                        .attr("style", "fill:none; stroke:black; stroke-width: 2px; stroke-linecap:round; stroke-linejoin:round; stroke-opacity:1");


            ///////////////////////
            // Обновление
            ///////////////////////

            points
                .attr("style", function(d) {
                    var px = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(d.dynamic.latitude, d.dynamic.longitude));
                    return "left: " + (px.x) + "px; top: " + (px.y) + "px";
                })
                .select('svg g path')
                    .attr("transform", function(d){return "rotate(" + d.dynamic.course + ")"});

            points.select('i')
                .attr('class', function(d){
                    return d.icon + " icon-large " + $freshmark.get(d.dynamic).class;
                });

            label = points.select("span.label");

            label.select("span.title").text(function(d) {return sysTitle(d);});
            label.select(".lastmarker-control>table>tbody tr.lastmarkerTime>td+td").text(function(d)  { return sysTime(d)});
            label.select(".lastmarker-control>table>tbody tr.lastmarkerSpeed>td+td").text(function(d) { return sysSpeed(d)});
            label.select(".lastmarker-control>table>tbody tr.lastmarkerVout>td+td").text(function(d)  { return sysVout(d)});
            label.select(".lastmarker-control>table>tbody tr.lastmarkerVin>td+td").text(function(d)   { return sysVin(d)});
            label.select(".lastmarker-control>table>tbody tr.lastmarkerSats>td+td").text(function(d)  { return sysSats(d)});
            label.select(".lastmarker-control>table>tbody tr.lastmarkerFuel>td+td").text(function(d)  { return sysFuel(d)});

            ///////////////////////
            // Удаление лишних
            ///////////////////////

            points.exit().remove();
        }

        return LastMarker;
    }
]);