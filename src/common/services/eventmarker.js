/*
    Маркер событий трека.
    Доступны маркеры:
    1. Стоянок.
    2. Остановок.
    3. Заправки.
    4. Сливы топлива.
    5. Тревожные события.
    ...
*/

function EventMarker(map)
{
    this.map = map;
    this.div = null;
    this.data = [];
    this.setMap(map);
}

EventMarker.prototype = new google.maps.OverlayView();

var SVG = {};
SVG.ns = "http://www.w3.org/2000/svg";
SVG.xlinkns = "http://www.w3.org/1999/xlink";

EventMarker.prototype.onAdd = function() {
    var div = this.div = document.createElement('div');

    div.setAttribute("class", "eventmarker");
    div.setAttribute("style","z-index:1000;");
    div.marker = this;
    var panes = this.getPanes();
    this.panes = panes;

    panes.overlayImage.appendChild(div);
}

EventMarker.prototype.setData = function(data) {
    this.data = data;
    this.draw();
}

EventMarker.prototype.onRemove = function() {
    // this.div.removeChild(this.arrdiv);
    this.div.parentNode.removeChild(this.div);
    this.arrdiv = null;
    this.div = null;
}

var eventDuration = function(d) {
    // return moment(new Date((d.point.dt * 1000))).format("DD/MM/YYYY : hh:mm");;
    if(d.end && d.point){
        var duration = (d.end.dt - d.point.dt);
        if(duration < 60) return "меньше минуты";
        else return moment.duration(duration * 1000).humanize();
    } else {
        return "";
    }
};

EventMarker.prototype.draw = function() {
    var overlayProjection = this.getProjection();
    if(!overlayProjection) return;

    var div = this.div;

    // console.log('EventMarker.prototype.draw', this.data, this.data[1]);

    // Назначим индексы стоянкам
    var index = 1;
    for(i=0; i<this.data.length; i++){
        var e = this.data[i];
        var title = "";
        if(e.type === "START"){
            title = "S";
        } else if(e.type === "FINISH"){
            title =  "F";
        } else if(e.type === "STOP"){
            title = "" + index;
            index += 1;
        } else {
        }
        e.title = title;
    }


    var track = d3.select(this.div);
    var points = track.selectAll(".track")
        .data(this.data);

    var div = points.enter().append("div")
        .attr("class", "track")
        // .attr("style", function(d){
        //     var px = overlayProjection.fromLatLngToDivPixel(d.pos);
        //     // console.log("d=", d, "px=", px);
        //     return "left: " + (px.x) + "px; top: " + (px.y) + "px";
        // })
        .on('click', function(d) {
            console.log("TODO", d3.select(this), d);
        });
    div.append("span").attr("class", "eventmarker-number").text(function(d){
        return d.title;
    });
    var nonumber = div.append('div').attr("class", "eventmarker-nonumber").text("P");
    var label = div.append("span").attr("class", "title");

            /*var label = div.append("div").attr("class", "lastmarker-label").text(function(d) {
                return d.title;
            });*/
            var control = label.append('div').attr("class", "lastmarker-control");
            var table = control.append('table').attr('id',function(d) {return 'eventMarkerID_' + d.point.course + d.point.dt});
            var tbody = table.append('tbody');
            //tbody = table.append('tbody');
            var timeLine = tbody.append('tr');
            timeLine.append('td').text(function(d) { return d.type == 'HOLD' ? 'Остановка:' : 'Стоянка:';});
            timeLine.append('td').text(function(d) { return eventDuration(d)});



    points
        .attr("class", function(d){
            // if()
            return "track " + d.type;
        })
        .attr("style", function(d){
            var px = overlayProjection.fromLatLngToDivPixel(d.position);
            // console.log("d=", d, "px=", px);
            return "left: " + (px.x) + "px; top: " + (px.y) + "px;";
        });

    points.exit().remove();

    // console.log('draw', this.data, points.select("div.stop"));

    // div.style.left = divpx.x - 16 + 'px';
    // div.style.top = divpx.y - 32 + 'px';
}

angular.module('services.eventmarker', [])

.factory('EventMarker', [
    "$rootScope",
    function($rootScope) {
        // console.log(":: EventMarker", $rootScope, EventMarker);
        return EventMarker;
    }
]);
