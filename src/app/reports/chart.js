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

        var link = function(scope, element){

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
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
                // .x(x)
                // .y(y)
                .scaleExtent([1, 100])
                .on("zoom", zoomed);

            var svg = d3.select(element[0]).select('.timechart-container')
                    .append('svg');

            var chart = svg
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .call(zoom);

            var clip = svg.append("clipPath")
                .attr("id", "clip")
                .append("rect");


            var plot = chart.append('rect')    // Невидимый объект, чтобы получать события мыши и тача, а также обрезка графика
                // .attr('style', 'opacity: 0')
                .attr('class', 'overlay');

            var xaxis = chart.append('g')
                .attr('class', 'x axis');

            // Ось Y: 0..10V
            var yaxis = chart.append('g')
                .attr('class', 'y axis');

            yaxis.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', 6)
                    .attr('dy', '.71em')
                    .style('text-anchor', 'end')
                    .text('Уровень топлива (л)');


            var line = d3.svg.line()
            .x(function(d) {
                return x(new Date(d.dt * 1000));
            })
            .y(function(d) {
                return y(d.fuel);
            });

            chart.append('path')
                .datum([])
                .attr('class', 'line')
                .attr("clip-path", "url(#clip)")
                .attr('d', line);


            var draw = function(){
                // TODO: SVG не масштабируется автоматически
                var width = element[0].clientWidth - margin.left - margin.right,
                    height = element[0].clientHeight - margin.top - margin.bottom;

                svg.attr('width', width + margin.left + margin.right)
                   .attr('height', height + margin.top + margin.bottom);

                plot
                    .attr("width", width)
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

                xAxis.ticks((width / 100) | 0);
                yAxis.ticks((height / 20) | 0).tickSize(-width);

                // var xAxis = d3.svg.axis()
                //     .scale(x)
                //     // .tickSubdivide(2)
                //     .tickSize(6, 4, 0)
                //     .orient('bottom')
                //     .ticks((width / 100) | 0)
                //     .tickFormat(d3.time.format('%H:%M:%S'));

                // var yAxis = d3.svg.axis()
                //     .scale(y)
                //     // .tickValues([1, 2, 3, 5, 8, 13, 21])
                //     .tickSubdivide(1)
                //     .tickSize(4, 2, 0)
                //     .orient('left');

                y.range([height, 0]);



                zoom.x(x);
                if(scope.zoomY) zoom.y(y);// else zoom.y(null);
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


            }

            function zoomed() {
                // var d = x.domain();
                // var dt = x(d[1]) - x(d[0]);
                // console.log('zoomed', zoom.translate(), x(d[0]), x(d[1]), dt);

                // var t = d3.event.translate;
                // zoom.translate([
                //     Math.min(0, t[0]),
                //     t[1]
                // ]);

                xaxis.call(xAxis);
                yaxis.call(yAxis);
                chart.select('path.line')
                    .attr('d', line);
            }

            var resizebind = $(window).bind('resize', function(){
                console.log('resize', element[0].clientWidth, element[0].clientHeight);
                draw();
            });

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
                        '<div>'+
                            '<label><input type="checkbox" ng-model="zoomY"> Масштаб Y</label>' +
                        '</div>'+
                    '</div>'+
                '</div>',
            replace: true,
            link: link
            // controller: ['$scope', '$element', function($scope, $element){}]
        };
    }
]);

