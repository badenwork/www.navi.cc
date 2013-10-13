/*
    Маркеры последних известных положений ТС.
*/


angular.module('services.lastmarker', ['newgps.services'])

.factory('LastMarker', [
    "$freshmark",
    function($freshmark) {
        // console.log(":: LastMarker:run", $freshmark);

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
            



            // var marker = d3.select(svg);

            // console.log('market div', div);
            panes.overlayImage.appendChild(div);
        }

        // LastMarker.prototype.setPosition = function(position) {
        //     this.position = position;
        //     // this.point = point;
        //     this.draw();
        // }
        LastMarker.prototype.setData = function(data) {
            // console.log('LastMarker.prototype.setData', data);
            this.data = data;
            this.draw();
        }

        LastMarker.prototype.onRemove = function() {
            // this.div.removeChild(this.arrdiv);
            this.div.parentNode.removeChild(this.div);
            this.arrdiv = null;
            this.div = null;
        }
        
        var sysTitle = function(sys) {
            return sys.title;
        };
        
        var sysTime = function(sys) {
            if (sys && sys.dynamic) {
                //var tz = (new Date()).getTimezoneOffset()/60;
                //var now = Math.round((new Date()).valueOf() / 1000);
                //var delta = now - sys.dynamic.lastping;
                //value = Math.floor(delta / 60);
              return moment((new Date((sys.dynamic.dt * 1000)))).format("DD/MM/YYYY : hh:mm");
            } else
                return '-';
        };
        
        var sysSpeed = function(sys) {
            if (sys && sys.dynamic)
                return Math.round(sys.dynamic.speed * 10) / 10;
            else
                return '-';
        };
        
        var sysVout = function(sys) {
            if (sys && sys.dynamic)
                return Math.round(sys.dynamic.vout * 100) / 100;
            else
                return '-';
        };
        
        var sysVin = function(sys) {
            if (sys && sys.dynamic)
                return Math.round(sys.dynamic.vin * 100)/100;
            else
                return '-';
        };
        
        var sysSats = function(sys) {
            if (sys && sys.dynamic)
                return sys.dynamic.sats;
            else
                return '-';
        };
        
        var sysFuel = function(sys) {
            if(sys.params && sys.params.fuel && sys.dynamic) {
                var fuelMap = sys.params.fuel;
                var fuel = sys.dynamic.fuel;
                var voltage = data * fuelMap[$scope.fuelMap.length-1].voltage/1024;
  
                for(var i = 1; i < fuelMap.length; i++){
                if(voltage==fuelMap[i-1].voltage) 
                    return fuelMap[i].liters;
                if(fuelMap[i-1].voltage<voltage && voltage<fuelMap[i].voltage){
                    var otnosh = (voltage - fuelMap[i-1].voltage)/(fuelMap[i].voltage - fuelMap[i-1].voltage)
                    var liters = fuelMap[i-1].liters + otnosh*(fuelMap[i].liters - fuelMap[i-1].liters)
                    return liters
                }
              }
            }
            return '-';
        };

        LastMarker.prototype.draw = function() {
            var overlayProjection = this.getProjection();
            
            if (!overlayProjection) return;

            // var divpx = overlayProjection.fromLatLngToDivPixel(this.position);
            var div = this.div;

 
            // var x = divpx.x;
            // var y = divpx.y;

            var track = d3.select(this.div);
            var points = track.selectAll(".marker")
                .data(this.data);
            var div = points.enter().append("div")
                .attr("class", "marker")
            // .attr("style", function(d){
            //     var px = overlayProjection.fromLatLngToDivPixel(d.pos);
            //     // console.log("d=", d, "px=", px);
            //     return "left: " + (px.x) + "px; top: " + (px.y) + "px";
            // })
            .on('click', function(d) {
                console.log(d3.select(this), d);
            });
///////////////////
            
             // div.append("i").attr("class", "icon-shopping-cart icon-large");
            div.append("i"); //.attr("class", function(d){ return d.icon + " icon-large"});
            var label = div.append("span").attr("class", "title").text(function(d) {
                return sysTitle(d);
            });

            /*var label = div.append("div").attr("class", "lastmarker-label").text(function(d) {
                return d.title;
            });*/
            var control = label.append('div').attr("class", "lastmarker-control");
            var table = control.append('table').attr('class','hide').attr('id',function(d) {return 'lastmarkerID_' + d.key});
            var tbody = table.append('tbody').attr('id',function(d) {return 'lastmarker_tbodyID_' + d.key});
            //tbody = table.append('tbody');
            var timeLine = tbody.append('tr');
            timeLine.append('td').text(function(d) { return 'Время';});
            timeLine.append('td').attr('class', 'lastmarkerTime').text(function(d) { return sysTime(d)});
            var speedLine = tbody.append('tr');
            speedLine.append('td').text(function(d) { return 'Скорость';});
            speedLine.append('td').attr('class', 'lastmarkerSpeed').text(function(d) { return sysSpeed(d)});
            var voutLine = tbody.append('tr');
            voutLine.append('td').text(function(d) { return 'Осн.питание';});
            voutLine.append('td').attr('class', 'lastmarkerVout').text(function(d) { return sysVout(d)});
            var vinLine = tbody.append('tr');
            vinLine.append('td').text(function(d) { return 'Рез.питание';});
            vinLine.append('td').attr('class', 'lastmarkerVin').text(function(d) { return sysVin(d)});
            var statsLine = tbody.append('tr');
            statsLine.append('td').text(function(d) { return 'Спутники';});
            statsLine.append('td').attr('class', 'lastmarkerSats').text(function(d) { return sysSats(d)});
            var fuelLine = tbody.append('tr');
            fuelLine.append('td').attr('class', function(d) { return d.hasFuelSensor ? "" : "hide";}).text(function(d) { return 'Топливо';});
            fuelLine.append('td').attr('class', function(d) { return d.hasFuelSensor ? "lastmarkerFuel" : "hide";}).text(function(d) { return sysFuel(d)});
            
            


	div.on('mouseout', function(e){
        var lastM = document.getElementById('lastmarkerID_' + e.key);
        lastM.setAttribute('class','hide');
	});
            
            
        div.on('mouseover', function(e){

        var lastM = document.getElementById('lastmarkerID_' + e.key);
        lastM.setAttribute('class','');
	}); 
            
///////////////////
            
           
            
            
            
            div.append("svg")
                .attr("style", 'position:absolute; left: -5px; top: -5px')
                .attr("width", 32)
                .attr("height", 32)
                .append("g")
                    .attr("transform", "translate(16, 16)")
                    .append('path')
                        .attr("d", "M -9,-10 0,-15 9,-10 0,-13 -9,-10")
                        .attr("style", "fill:none; stroke:black; stroke-width: 2px; stroke-linecap:round; stroke-linejoin:round; stroke-opacity:1");
                        // .attr("transform", "rotate(" + 90 + ")");


            points
                .attr("style", function(d) {
                    var px = overlayProjection.fromLatLngToDivPixel(new google.maps.LatLng(d.dynamic.latitude, d.dynamic.longitude));
                    // console.log("d=", d, "px=", px);
                    return "left: " + (px.x) + "px; top: " + (px.y) + "px";
                })
                .select('svg g path')
                    .attr("transform", function(d){return "rotate(" + d.dynamic.course + ")"});

            points.select('i')
                .attr('class', function(d){
                    return d.icon + " icon-large " + $freshmark.get(d.dynamic).class;
                });
            points.exit().remove();
            
            var sp = d3.select("span");
            var title = sp.selectAll(".title").data(this.data);
            title.enter();
            title.text(function(d) { return sysTitle(d)});
            title.exit().remove();
            
            var body = d3.select("body");
            
            var time = body.selectAll(".lastmarkerTime").data(this.data);
            time.enter();
            time.text(function(d) { return sysTime(d)});
            time.exit().remove();
            
            var speed = body.selectAll(".lastmarkerSpeed").data(this.data);
            speed.enter();
            speed.text(function(d) { return sysSpeed(d)});
            speed.exit().remove();
            
            var vout = body.selectAll(".lastmarkerVout").data(this.data);
            vout.enter();
            vout.text(function(d) { return sysVout(d)});
            vout.exit().remove();
            
            var vin = body.selectAll(".lastmarkerVin").data(this.data);
            vin.enter();
            vin.text(function(d) { return sysVin(d)});
            vin.exit().remove();
            
            var sats = body.selectAll(".lastmarkerSats").data(this.data);
            sats.enter();
            sats.text(function(d) { return sysSats(d)});
            sats.exit().remove();
            
            var fuel = body.selectAll(".lastmarkerFuel").data(this.data);
            fuel.enter();
            fuel.text(function(d) { return sysFuel(d)});
            fuel.exit().remove();
        }





        return LastMarker;
    }
]);