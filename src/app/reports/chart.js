/* global angular:true, d3:true, $:true, moment:true, console:true  */


angular.module('config.system.params', ['ngRoute', '$strap', 'resources.geogps', 'app.filters', 'config.system.params.master', 'config.system.params.fuel', 'services.tags'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/reports/:skey/chart/:day', {
            templateUrl: 'templates/reports/chart.tpl.html',
            controller: 'ReportsChartCtrl as ctrl',
            resolve: {
                account: ['Account',        // Да, вот ради списка всех систем для коллекции ярлыков
                    function(Account) {
                        return Account.get();
                    }
                ],
                system: ['System', '$route',
                    function(System, $route) {
                        return System.get($route.current.params.skey);
                    }
                ]
            }
        });
    }
])

.controller('ReportsChartCtrl', ['$scope', '$route', '$routeParams', 'account', 'system', 'System', 'GeoGPS',
    function($scope, $route, $routeParams, account, system, System, GeoGPS) {
        'use strict';

        var day = $scope.day = $routeParams.day || 0;
        this.skey = $routeParams.skey;
        var date;
        var hourfrom;

        // var tz = (new Date()).getTimezoneOffset() / 60;

        if ((1 * day) === 0) {
            hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600;
            date = new Date(hourfrom * 3600 * 1000);
        } else if ((1 * day) === -1) {
            hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600 - 24;
        } else {
            // hourfrom = day * 24 + tz;
            hourfrom = day * 24;
            var tz = (new Date(hourfrom * 3600 * 1000)).getTimezoneOffset() / 60;   // Уточняем временную зону
            hourfrom = day * 24 + tz;
        }
        date = new Date(hourfrom * 3600 * 1000);
        $scope.datetime = hourfrom * 3600;

        console.log('ReportsChartCtrl', this, $scope, date, hourfrom);

        $scope.system = system;
        $scope.skey = $routeParams.skey;


        if ($scope.skey && ($scope.skey !== '') && ($scope.skey !== '+')) {
            GeoGPS.select($scope.skey);
            GeoGPS.getTrack(hourfrom, hourfrom + 23)
                .then(function(data) {
                    $scope.data = data;
                    // $scope.myPagingFunction();
                    console.log('data=', data)
                });

            $scope.onMouseOver = function(g) {
                $scope.center = g;
            };
        }

}])

.directive('timechart', [
    function() {
        'use strict';


        var bisect = d3.bisector(function(d) { return d.dt; }).right;

        var link = function(scope, element){

            var margin = {
                top: 20,
                right: 20,
                bottom: 60,
                left: 60
            };
            var svg;

            var x = d3.time.scale.utc();
            var y = d3.scale.linear();


            var xAxis = d3.svg.axis()
                .scale(x)
                // .tickSubdivide(2)
                .tickSize(6, 4, 0)
                .orient('bottom')
                .tickFormat(d3.time.format('%H:%M:%S'));

            var yAxis = d3.svg.axis()
                .scale(y)
                // .tickValues([1, 2, 3, 5, 8, 13, 21])
                // .tickSubdivide(1)
                // .tickPadding(2)
                .tickSize(4, 2, 0)
                // .tickSize(-width)
                .orient('left');

            var zoom = d3.behavior.zoom()
                // .scaleExtent([1, 100])
                .on("zoom", zoomed);

            var zoomX = d3.behavior.zoom()
                .on("zoom", zoomedX);

            var zoomY = d3.behavior.zoom()
                .on("zoom", zoomedY);


            var svg = d3.select(element[0]).select('.timechart-container').append('svg');
                    // .on('mousemove.drag', mousemove)
                    // .on("touchmove.drag", mousemove)
                    // .on("mouseup.drag",   mouseup)
                    // .on("touchend.drag",  mouseup);

            var clip = svg.append("clipPath")
                .attr("id", "clip")
                .append("rect");

            var chart = svg
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Иерархия:
            // .plot -> график
            // .axisx -> Ось времени
            // .axisy -> Ось значения


            var axisx = chart.append('g')
                        .attr('class', 'axisx')
                        .call(zoomX);

            axisx.append('rect')    // Невидимый объект, чтобы получать события мыши и тача, а также обрезка графика
                .attr('height', margin.bottom)
                .attr('class', 'helper');

            var axisy = chart.append('g')
                        .attr('class', 'axisy')
                        .call(zoomY);

            axisy.append('rect')    // Невидимый объект, чтобы получать события мыши и тача, а также обрезка графика
                .attr('x', -margin.left)
                .attr('width', margin.left)
                .attr('class', 'helper');


            var xaxis = axisx.append('g')
                .attr('class', 'x axis');
                // .on("mousedown.drag",  xaxis_drag)
                // .on("touchstart.drag", xaxis_drag);

            // Ось Y: 0..10V
            var yaxis = axisy.append('g')
                .attr('class', 'y axis');

            // yaxis.append('text')
            //         .attr('transform', 'rotate(-90)')
            //         .attr('y', 6)
            //         .attr('dy', '.71em')
            //         .style('text-anchor', 'end')
            //         .text('Уровень топлива (л)');


            var plot = chart.append('g')
                        .attr('class', 'plot')
                        .on('mousemove', hover)
                        .call(zoom);

            plot.append('rect')    // Невидимый объект, чтобы получать события мыши и тача, а также обрезка графика
                .attr('class', 'helper');


            var line = d3.svg.line()
                .x(function(d) {
                    return x(new Date(d.dt * 1000));
                })
                .y(function(d) {
                    return y(d.fuel);
                });

            plot.append('path')
                .datum([])
                .attr('class', 'line')
                .attr("clip-path", "url(#clip)")
                .attr('d', line);

            var cursor = plot.append('circle')
                .attr('class', 'dot')
                .attr('r', 5);

            var projectx = plot.append('line')
                .attr('class', 'project');

            var projecty = plot.append('line')
                .attr('class', 'project');

            var startdragx = null;

            function mousemove(e){
                if(startdragx){
                    console.log('mousemove');
                }
            }

            function mouseup(e){
                if(startdragx){
                    console.log('mouseup');
                    startdragx = null;
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }
            }

            function xaxis_drag(e){
                var p = d3.mouse(this);
                startdragx = x.invert(p[0])
                console.log('xaxis_drag', this, p, startdragx);
            }

            var draw = function(){
                // TODO: SVG не масштабируется автоматически
                var width = element[0].clientWidth - margin.left - margin.right,
                    height = element[0].clientHeight - margin.top - margin.bottom;

                svg.attr('width', width + margin.left + margin.right)
                   .attr('height', height + margin.top + margin.bottom);

                plot.select('rect.helper')
                    .attr("width", width)
                    .attr("height", height);

                axisx.select('rect.helper')
                    .attr("y", height)
                    .attr("width", width);

                axisy.select('rect.helper')
                    .attr("height", height);

                // var x = d3.scale.linear()
                //     .range([0, width]);
                if(!scope.data) return;
                var data = scope.data;

                // var start = new Date('10/28/2013 00:00:00'),
                //     stop = new Date('10/28/2013 23:59:59');
                var start = new Date(data.min_hour * 3600 * 1000),
                    stop = new Date((data.max_hour+1) * 3600 * 1000);

                console.log('timechart draw', scope.data, start, stop);

                x.domain([start, stop])
                    .range([0, width]);

                // y.domain([40, 50]);
                y.domain(d3.extent(data.points, function(d) {
                    return d.fuel;
                }));

                xAxis.ticks((width / 120) | 0);
                yAxis.ticks((height / 20) | 0).tickSize(-width);

                y.range([height, 0]);

                zoom.x(x); zoom.y(y);
                zoomX.x(x);
                zoomY.y(y);
                // zoom.y(y);
                // if(scope.zoomY) zoom.y(y);// else zoom.y(null);
                    // .call(zoom);

                clip
                    // .attr("x", x(0))
                    // .attr("y", y(1))
                    // .attr("width", x(1) - x(0))
                    // .attr("height", y(0) - y(1));
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height);

                chart.select('rect.overlay').attr('width', width).attr('height', height);

                // Ось времени

                xaxis.attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis);


                // Ось данных

                yaxis.call(yAxis);

                // График

                chart.select('path.line')
                    .datum(data.points) //.transition()
                    .attr('d', line);

                // Проекции
                projectx
                    .attr('y2', height);

                projecty
                    .attr('x2', 0);

            }

            scope.hover = {
                dt: 0,
                value: 0
            };

            function hover() {
                var data = scope.data.points;
                var mx = d3.mouse(this);
                var dx = x.invert(mx[0]);
                var i = bisect(data, dx.valueOf() / 1000);
                console.log('hover', dx, i);
                // var
                scope.$apply(function(){
                    scope.hover.dt = data[i].dt;
                    scope.hover.value = data[i].fuel;
                });

                var cx = x(new Date(data[i].dt * 1000));
                var cy = y(data[i].fuel);

                cursor
                    .attr('cx', cx)
                    .attr('cy', cy);

                projectx
                    .attr('x1', cx)
                    .attr('y1', cy)
                    .attr('x2', cx);

                projecty
                    .attr('x1', cx)
                    .attr('y1', cy)
                    .attr('y2', cy);

            }

            function zoomed() {
                // var d = x.domain();
                // var dt = x(d[1]) - x(d[0]);
                // console.log('zoomed', x.domain(), x.range());

                // var t = d3.event.translate;
                // zoom.translate([
                //     Math.min(0, t[0]),
                //     t[1]
                // ]);

                xaxis.call(xAxis);
                yaxis.call(yAxis);
                chart.select('path.line')
                    .attr('d', line);


                zoomX.x(x);
                zoomY.y(y);

            }

            function zoomedX() {
                // console.log('zoomedX', x.domain(), x.range());
                xaxis.call(xAxis);
                chart.select('path.line')
                    .attr('d', line);

                zoom.x(x); zoom.y(y);
                zoomY.y(y);

            }

            function zoomedY() {
                // console.log('zoomedY', x.domain(), x.range());
                yaxis.call(yAxis);
                chart.select('path.line')
                    .attr('d', line);

                zoom.x(x); zoom.y(y);
                zoomX.x(x);

            }


            var resizebind = $(window).bind('resize', function(){
                console.log('resize', element[0].clientWidth, element[0].clientHeight);
                draw();
            });

            scope.reZoom = draw;

            // scope.$on('$routeChangeSuccess', function() {
            //     console.log('on out');
            // });

            // scope.$destroy(function(){
            // })
            scope.$on("$destroy", function() {
                // console.log('on out', resizebind);
                // $(window).unbind(resizebind);
                $(window).unbind('resize');
            });

            scope.$watch('data', function(){
                draw();
            });

            scope.$watch('zoomY', function(init){
                console.log('zoomY', scope.zoomY);
                draw();
                // zoom.x(x);
                // if(scope.zoomY) zoom.y(y);
            });

        }

        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            // template: '<svg width='500px' height='250px' class='chart'></svg>',
            template:
                '<div class="timechart">'+
                    '<div class="timechart-container"></div>'+
                    '<div class="timechart-control">'+
                        '<button class="btn" ng-click="reZoom()"><i class="icon-resize-full icon-2x"></i></button>' +
                        '<br/>' +
                        '{{ hover.dt | datetime:true:\'time\' }}<br>' +
                        '{{ hover.value | number:2  }}<br>' +
                        // '<div>'+
                        //     '<label><input type="checkbox" ng-model="zoomY"> Масштаб Y</label>' +
                        // '</div>'+
                    '</div>'+
                '</div>',
            replace: true,
            link: link
            // controller: ['$scope', '$element', function($scope, $element){}]
        };
    }
]);

