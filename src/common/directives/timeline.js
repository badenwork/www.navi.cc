angular.module('directives.timeline', [])

.directive('timeline', [function() {
    var link = function(scope, element, attrs) {

        var data = null;
        var tz = (new Date()).getTimezoneOffset() / 60;
        // console.log(tz);

        var margin = {top: 0, right: 32, bottom: 0, left: 32},
            width = element.width() - 50 - margin.left - margin.right,
            height = 32 - margin.top - margin.bottom;

        var svg = d3.select(element[0]).select(".timeline")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

        var zoom, x, xAxis;

        function zoomed() {
            // console.log("translate=", d3.event.translate);
            // console.log("d3.event.scale=", d3.event.scale);
            // chart.attr("transform", "translate(" + d3.event.translate[0] + ", 0)scale(" + d3.event.scale + ")");
            // chart.attr("transform", "translate(" + d3.event.translate[0] + ", 0)");
            // Ось времени
            svg.select(".x.axis").call(xAxis);

            // Данные
            var intervals = svg.select('.chart').selectAll(".interval")
                .data(data);
            intervals
                .select('rect')
                    .attr('x', function(d){
                        return x(new Date(d.start.dt * 1000));
                    })
                    .attr('width', function(d){
                        return d3.max([2, x(new Date(d.stop.dt * 1000)) - x(new Date(d.start.dt * 1000))]);
                    });
        }

        // TODO: Не нравится мне что при каждом draw пересоздается все.
        // Нужно оценить на возможные утечки памяти
        function draw() {
            // console.log("draw", data);
            if(data == null) return;

            var start = new Date(data[0].start.dt * 1000),
                stop = new Date(data[data.length-1].stop.dt * 1000);

            x = d3.time.scale.utc()
                .domain([start, stop])
                .range([0, width]);

            xAxis = d3.svg.axis()
                .scale(x)
                .tickSubdivide(3)
                .tickSize(15, 8, 0)
                .orient("bottom")
                .ticks((width / 90) | 0)
                .tickFormat(d3.time.format("%H:%M:%S"));

            zoom = d3.behavior.zoom()
                .x(x)
                .scaleExtent([1, 1024])   // TODO: Необходимо также ограничить translate
                .on("zoom", zoomed);

            // avar
            svg.select('g').remove();

            var chart = svg
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .call(zoom);

            chart.append("rect")          // Невидимый объект, чтобы получать события мыши и тача
                .attr("style", "opacity: 0")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height);

                // svg.
            var axis = chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0,1)")
                .call(xAxis);

            var graph = chart.append("g")
                .attr("class", "chart");

            // console.log("svg", svg);

            // function zoomed() {
            //     // console.log("translate=", d3.event.translate);
            //     // console.log("d3.event.scale=", d3.event.scale);
            //     // chart.attr("transform", "translate(" + d3.event.translate[0] + ", 0)scale(" + d3.event.scale + ")");
            //     // chart.attr("transform", "translate(" + d3.event.translate[0] + ", 0)");
            //     // Ось времени
            //     svg.select(".x.axis").call(xAxis);

            //     // Данные
            //     var intervals = svg.select('.chart').selectAll(".interval")
            //         .data(data);
            //     intervals
            //         .select('rect')
            //             .attr('x', function(d){
            //                 return x(new Date(d.start.dt * 1000));
            //             })
            //             .attr('width', function(d){
            //                 return d3.max([2, x(new Date(d.stop.dt * 1000)) - x(new Date(d.start.dt * 1000))]);
            //             });
            // }

            // svg.select("g.x.axis").transition() //.duration(10000)
            //     .attr("transform", "translate(0,1)")
            //     .call(xAxis);

            // var ticks = x.ticks(d3.time.minute, 15);
            // console.log("data=", data, start, stop);

            // Данные
            var intervals = svg.select('.chart').selectAll(".interval")
                .data(data);

            var g = intervals.enter().append("g")
                .attr("class", function(d) {
                    return "interval " + d.type;
                })
                .on('click', function(d) {
                    scope.click()(d);
                })
                .on('mouseenter', function(d){
                    scope.hover()(d);
                });

            g.append("rect")
                .attr('x', function(d){
                    return x(new Date(d.start.dt * 1000));
                })
                .attr('width', function(d){
                    return x(new Date(d.stop.dt * 1000)) - x(new Date(d.start.dt * 1000));
                })
                .attr("y", "2")
                .attr("height", "15");

            intervals.exit().remove();

            var start = new Date(data[0].start.dt * 1000),
                stop = new Date(data[data.length-1].stop.dt * 1000);

            // console.log("x.domain=", x.domain());
        }

        scope.$watch("data", function(_data){
            // console.log(['timeline on data', _data]);
            data = _data;
            draw();
        }, true);

        var scaledelta = Math.pow(2, 120 * 0.002);

        element.find("#plusButton").on('click', function(){
            zoom.scale(zoom.scale() * scaledelta);
            zoomed();
        });

        element.find("#minusButton").on('click', function(){
            zoom.scale(zoom.scale() / scaledelta);
            zoomed();
        });
    };

    return {
        restrict: 'A',
        // transclude: false,
        //scope: {last_pos: '='},
        //template: '<div>List:<ul><li ng-repeat="l in list">{{l}}<i class="icon-arrow-right"></i><span>{{l}}</span></li></ul></div>',
        scope: {
            data: "=",
            hover: "&onHover",
            click: "&onClick"
        },
        // template: '<svg width="2500px" height="33px" class="timeline"></svg>',
        template:
            '<div>' +
                '<div id="minusButton" style="position:absolute;left:0;top:0"><img src="img/minus_button.png" width="32" height="32"/></div>'+
                '<div style="position:absolute;left:32px;top:0;right:32px;bottom:0px;overflow-x:hidden;overflow-y:hidden"><div class="timeline"></div></div>'+
                '<div id="plusButton" style="position:absolute;right:0;top:0"><img src="img/plus_button.png" width="32" height="32"/></div>'+
            '</div>',
        replace: true,
        link: link
    };
}]);
