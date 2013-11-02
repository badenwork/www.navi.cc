/* global angular:true, d3:true, $:true, console:true, moment:true  */


angular.module('reports.chart', ['ngRoute', '$strap', 'resources.geogps', 'app.filters', 'config.system.params.master', 'config.system.params.fuel', 'services.tags', 'i18n'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/reports/:skey/chart', {
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
            },
            reloadOnSearch: false
        });
    }
])

.service('ParamParser', function(){
    'use strict';
    console.log('ParamParser', this);
    var format = d3.time.format('%d/%m/%Y');
    return {
        day: function(day){ // День от рождества или 0, -1, -2 - относительно Сегодня

            day = (day || '0') | 0;
            if (day <= 0) {
                return format.parse(format(moment().subtract('days', (-day)).toDate()));
            } else {
                // TODO: Я не очень уверен на счет правильности.
                return format.parse(format(moment(0).add('days', (day)).toDate()));
            }

        },

        asday:function(date){   // Делает обратное преобразование
            var first = format.parse(format(moment(0).toDate()));
            return Math.round(moment.duration(moment(date) - moment(first)).asDays());
        }
    };
})

.controller('ReportsChartCtrl', ['$scope', '$route', '$routeParams', '$location', 'account', 'system', 'System', 'GeoGPS', 'ParamParser',
    function($scope, $route, $routeParams, $location, account, system, System, GeoGPS, ParamParser) {
        'use strict';

        // var day = $scope.day = $routeParams.day || 0;

        // console.log('ParamParser=', ParamParser, day_from, day_to);

        // this.skey = $routeParams.skey;
        // var date;
        // var hourfrom;

        // var format = d3.time.format('%d/%m/%Y');


        // console.log('$routeParams = ', $routeParams, $scope.chart);
        $scope.system = system;
        $scope.skey = $routeParams.skey;

        // var day_from =

        $scope.charts = [
            {name: 'vout', title: 'Напряжение основного питания', field: 'vout', min: 0.0},
            {name: 'vin', title: 'Напряжение резервного питания', field: 'vin', min: 3.0},
            {name: 'fuel', title: 'Уровень топлива', field: 'fuel', min: 0.0},
            {name: 'speed', title: 'Скорость', field: 'speed', min: 0.0},
            {name: 'sats', title: 'Спутники', field: 'sats', min: 0.0}
            // {name: 'temp', title: 'Температура окружающей среды', field: 'temp'}
        ];

        $scope.dateFrom = ParamParser.day($routeParams.from);
        $scope.dateTo = ParamParser.day($routeParams.to);
        $scope.range = ($routeParams.from != $routeParams.to);

        var hourfrom = $scope.dateFrom.valueOf() / 1000 / 3600;
        var hourto = $scope.dateTo.valueOf() / 1000 / 3600 + 23;

        var reload = function(){
            console.log('reload', hourfrom, hourto);
            if ($scope.skey && ($scope.skey !== '') && ($scope.skey !== '+')) {
                GeoGPS.select($scope.skey);
                GeoGPS.getTrack(hourfrom, hourto)
                    .then(function(data) {
                        $scope.data = data;
                    });
            }
        };

        var reroute = function(){
            // var day_from = $scope.dateFrom = ParamParser.day($routeParams.from);
            // var day_to = $scope.dateTo = ParamParser.day($routeParams.to);
            var _hourfrom = $scope.dateFrom.valueOf() / 1000 / 3600;
            var _hourto = $scope.dateTo.valueOf() / 1000 / 3600 + 23;
            console.log('reroute', _hourfrom, _hourto);
            if((_hourfrom != hourfrom) || (_hourto != hourto)){
                hourfrom = _hourfrom;
                hourto = _hourto;
                reload();
            }

            if($routeParams.chart){
                $scope.charts.some(function(el){
                    if(el.name === $routeParams.chart) {
                        $scope.chart = el;
                        return true;
                    } else return false;
                });
            }
        };

        reroute();
        reload();

        // TODO: То, что смена графика заполняет history может быть неудобно
        // Можно воспользоваться следующим подходом: http://johan.driessen.se/posts/Manipulating-history-with-the-HTML5-History-API-and-AngularJS

        $scope.onSelect = function(){
            // console.log('select', $scope.chart);
            if($scope.chart === null) {
                $location.search({});
                $location.replace();
            } else {
                var params = {
                    chart: $scope.chart.name,
                    'from': $routeParams.from,
                    'to': $routeParams.to
                };
                $location.search(params);
                $location.replace();
            }
            // $location.path('/gps/' + $scope.skey);
        };

        // var init_ = $scope.dateFrom;
        var dayChange = function(){
            var day_from = ParamParser.asday($scope.dateFrom);
            var day_to = ParamParser.asday($scope.dateTo);

            if((($routeParams.from | 0) != day_from) || (($routeParams.to | 0) != day_to)){
                var params = {
                    chart: $scope.chart.name,
                    'from': day_from,
                    'to': day_to
                };

                console.log('change search =', $scope.dateFrom, $scope.dateTo, params);
                $location.search(params);
                $location.replace();
                // $scope.dateFrom
            }
        };

        $scope.$watch('dateFrom+dateTo', dayChange);
        // $scope.$watch('dateTo', dayChange);


        $scope.$on('$routeUpdate', function() {
            // console.log('$routeUpdate', $routeParams);
            $scope.dateFrom = ParamParser.day($routeParams.from);
            $scope.dateTo = ParamParser.day($routeParams.to);
            reroute();
        });

        // $scope.date = date;



}])

.directive('datepicker', ['i18n',
    function(i18n) {
        'use strict';

        var link = function(scope, element){
            // console.log('datepicker scope=', scope);

            var datepicker = element.find('.inputDate');
            var dp = datepicker.datepicker({
                todayBtn: 'linked',
                language: i18n.shortLang(),
                autoclose: true,
                format: 'dd/mm/yyyy',
                todayHighlight: true
            }).on('changeDate', function() {
                scope.$apply(function() {
                    // var date = parseDate(element.find('.inputDate').val());
                    var date = datepicker.datepicker('getDate');
                    scope.dateFrom = date;
                    scope.dateTo = date;
                });
                // scope.onChange({foo:'bar'});
            });


            // dp.datepicker('setDate', new Date());

            var daterange = element.find('.input-daterange');
            daterange.datepicker({
                todayBtn: 'linked',
                language: i18n.shortLang(),
                autoclose: true,
                format: 'dd/mm/yyyy',
                todayHighlight: true
            }).on('changeDate', function() {
                scope.$apply(function() {
                    // TODO: Я не знаю как доставать дату из daterange
                    // var start = parseDate(element.find('input[name="start"]').val());
                    // var stop  = parseDate(element.find( 'input[name="stop"]').val());
                    var start = element.find('input[name="start"]').datepicker('getDate');
                    scope.dateFrom = start;
                    var stop = element.find('input[name="stop"]').datepicker('getDate');
                    scope.dateTo = stop;

                    // scope.onChange({start: start, stop: stop});
                    // dp.datepicker('setDate', start);
                });
                // scope.onChange();
            });


            scope.selectday = function(day){
                console.log('selectday', day);
            };

            scope.toggleRange = function(){
                scope.range = true;

                var date = datepicker.datepicker('getDate');
                scope.dateFrom = date;
                scope.dateTo = date;
                // element.find('input[name="start"]').datepicker('setDate', date);
                // element.find('input[name="stop"]').datepicker('setDate', date);
            };

            scope.toggleSingle = function(){
                scope.range = false;

                var start = element.find('input[name="start"]').datepicker('getDate');
                // scope.dateFrom = start;
                dp.datepicker('setDate', start);
                if(scope.dateFrom != scope.dateTo){
                    scope.dateTo = start;
                    // scope.onChange();
                }
            };

            scope.$watch('dateFrom', function(){
                // console.log('dateFrom=', scope.dateFrom);
                element.find('input[name="start"]').datepicker('setDate', scope.dateFrom);
                if(!scope.range) {
                    dp.datepicker('setDate', scope.dateFrom);
                }
            });

            scope.$watch('dateTo', function(){
                // console.log('dateTo=', scope.dateTo);
                element.find('input[name="stop"]').datepicker('setDate', scope.dateTo);
            });

            scope.prevDay = function(){
                var format = d3.time.format('%d/%m/%Y');
                var prev = format.parse(format(moment(scope.dateFrom).subtract('days', 1).toDate()));
                scope.dateFrom = prev;
                scope.dateTo = prev;
                console.log('prevDay', scope.dateFrom, prev);
            };

            scope.nextDay = function(){
                var format = d3.time.format('%d/%m/%Y');
                var next = format.parse(format(moment(scope.dateFrom).add('days', 1).toDate()));
                scope.dateFrom = next;
                scope.dateTo = next;
                console.log('nextDay', scope.dateFrom, next);
            };

        };
        return {
            restrict: 'E',
            scope: {
                dateFrom: '=',
                dateTo: '=',
                range: '='
                // onChange: '&'
            },
            // template: '<svg width='500px' height='250px' class='chart'></svg>',
            template:
                '<div>'+
                    '<div class="btn-group" ng-hide="range">'+
                        '<button class="btn btn-primary" ng-click="prevDay()">&lt;</button>'+
                        '<input  class="btn btn-primary inputDate" />'+
                        '<button class="btn btn-primary" ng-click="toggleRange()">&hellip;</button>'+
                        '<button class="btn btn-primary" ng-click="nextDay()">&gt;</button>'+
                    '</div>'+

                    '<div class="btn-group input-daterange" ng-show="range">'+
                        '<input class="btn btn-primary" name="start" />'+
                        '<button class="btn btn-primary" ng-class="" ng-click="toggleSingle()">&hellip;</button>'+
                        '<input class="btn btn-primary" name="stop" />'+
                    '</div>'+
                '</div>',

            replace: true,
            link: link
            // controller: ['$scope', '$element', function($scope, $element){}]
        };
    }
])

.directive('timechart', [
    function() {
        'use strict';

        var bisect = d3.bisector(function(d) { return d.dt; }).right;

        var link = function(scope, element){

            var margin = {
                top: 10,
                right: 50,
                bottom: 50,
                left: 50
            };

            var x = d3.time.scale.utc();
            var y = d3.scale.linear();
            var y2 = d3.scale.linear();

            var hourformat = d3.time.format('%H:%M:%S');
            // var dayformat = d3.time.format('%d %b');
            // var monthformat = d3.time.format('%b %Y');
            // var yearformat = d3.time.format('%y');

            var xAxis = d3.svg.axis()
                .scale(x)
                // .tickSubdivide(2)
                .tickSize(6, 4, 0)
                .orient('bottom')
                // .tickSubdivide(true)
                .tickFormat(hourformat);

            var xAxisD = d3.svg.axis()
                .scale(x)
                // .tickSubdivide(3)
                .tickSize(0)
                // .ticks(d3.min([d3.time.days, 2, 4]))
                // .ticks(d3.time.days, 1)
                .orient('bottom')
                .tickFormat(Dformat)
                // .tickFormat(dayformat);
                // .tickSize(4)
                // .tickPadding(0);
                ;

            function Dformat(d) {
                var delta = moment.duration(x.domain()[1] - x.domain()[0]).asDays();
                var step = Math.round(width / 100);
                // console.log('Dformat', d, delta, step);
                if(delta > 30 * step) {
                    // return monthformat(d);
                    return moment(d).format('DD/MM/YY');
                } else {
                    // return dayformat(d);
                    return moment(d).format('D MMM');
                }
              // var s = formatNumber(d / 1e6);
              // return d === y.domain()[1]
              //     ? "$" + s + " million"
              //     : s;
            }

            var yAxis = d3.svg.axis()
                .scale(y)
                // .tickValues([1, 2, 3, 5, 8, 13, 21])
                // .tickSubdivide(1)
                // .tickPadding(2)
                .tickSize(4, 2, 0)
                // .tickSize(-width)
                .orient('left');

            var yAxis2 = d3.svg.axis()
                .scale(y2)
                // .tickValues([1, 2, 3, 5, 8, 13, 21])
                // .tickSubdivide(1)
                // .tickPadding(2)
                .tickSize(4, 2, 0)
                // .tickSize(-width)
                .orient('right');

            var zoom = d3.behavior.zoom()
                .on('zoom', zoomed)
                .on('zoomend', zoomend);

            var zoomX = d3.behavior.zoom()
                .on('zoom', zoomedX)
                .on('zoomend', zoomend);

            var zoomY = d3.behavior.zoom()
                .on('zoom', zoomedY)
                .on('zoomend', zoomend);

            var zoomY2 = d3.behavior.zoom()
                .on('zoom', zoomedY2)
                .on('zoomend', zoomend);

            var svg = d3.select(element[0]).select('.timechart-container').append('svg');
                    // .on('mousemove.drag', mousemove)
                    // .on("touchmove.drag", mousemove)
                    // .on("mouseup.drag",   mouseup)
                                // .on("touchend.drag",  mouseup);
            svg.append('linearGradient')
                    .attr('id', 'line-gradient')
                    .attr('gradientUnits', 'userSpaceOnUse')
                    .attr('x1', 0).attr('y1', 0)
                    .attr('x2', 500).attr('y2', 0)
                .selectAll('stop')
                    .data([
                        {offset: '0%', color: 'blue', opacity: 0.3},
                        // {offset: "50%", color: "red"},
                        {offset: '100%', color: 'blue', opacity: 0}
                    ])
                .enter().append('stop')
                    .attr('offset', function(d) { return d.offset; })
                    .attr('stop-color', function(d) { return d.color; })
                    .attr('stop-opacity', function(d) { return d.opacity; });

            svg.append('linearGradient')
                    .attr('id', 'line-gradient2')
                    .attr('gradientUnits', 'userSpaceOnUse')
                    .attr('x1', 0).attr('y1', 0)
                    .attr('x2', -500).attr('y2', 0)
                .selectAll('stop')
                    .data([
                        {offset: '0%', color: 'red', opacity: 0.3},
                        // {offset: "50%", color: "red", opacity: 1},
                        {offset: '100%', color: 'red', opacity: 0}
                    ])
                .enter().append('stop')
                    .attr('offset', function(d) { return d.offset; })
                    .attr('stop-color', function(d) { return d.color; })
                    .attr('stop-opacity', function(d) { return d.opacity; });
// stop-opacity:1

            var clip = svg.append('clipPath')
                .attr('id', 'clip')
                .append('rect')
                    .attr('x', -3)
                    .attr('y', -3);

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

            var axisy2 = chart.append('g')
                        .attr('class', 'axisy')
                        .call(zoomY2);

            axisy2.append('rect')    // Невидимый объект, чтобы получать события мыши и тача, а также обрезка графика
                .attr('width', margin.right)
                .attr('class', 'helper');


            var xaxis = axisx.append('g')
                .attr('class', 'x axis');
                // .on("mousedown.drag",  xaxis_drag)
                // .on("touchstart.drag", xaxis_drag);

            var xaxisD = axisx.append('g')
                .attr('class', 'x axis');

            // Ось Y: 0..10V
            var yaxis = axisy.append('g')
                .attr('class', 'y axis');

            var yaxis2 = axisy2.append('g')
                .attr('class', 'y2 axis');

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
                // .interpolate('basis')
                .x(function(d) {
                    return x(new Date(d.dt * 1000));
                })
                .y(function(d) {
                    return y(d[field]);
                });

            var line2 = d3.svg.line()
                // .interpolate('basis')
                .x(function(d) {
                    return x(new Date(d.dt * 1000));
                })
                .y(function(d) {
                    return y2(d[field2]);
                });

            plot.append('path')
                .datum([])
                .attr('class', 'line')
                .attr('clip-path', 'url(#clip)')
                .attr('d', line);

            plot.append('path')
                .datum([])
                .attr('class', 'line2')
                .attr('clip-path', 'url(#clip)')
                .attr('d', line2);

            var cursor = plot.append('circle')
                .attr('class', 'dot')
                .attr('r', 5);

            var cursor2 = plot.append('circle')
                .attr('class', 'dot2')
                .attr('r', 5);

            var projectx = plot.append('line')
                .attr('class', 'project');

            var projecty = plot.append('line')
                .attr('class', 'project');

            var projecty2 = plot.append('line')
                .attr('class', 'project2');

            // var startdragx = null;

            // function mousemove(){
            //     if(startdragx){
            //         console.log('mousemove');
            //     }
            // }

            // function mouseup(){
            //     if(startdragx){
            //         console.log('mouseup');
            //         startdragx = null;
            //         d3.event.preventDefault();
            //         d3.event.stopPropagation();
            //     }
            // }

            // function xaxis_drag(){
            //     var p = d3.mouse(this);
            //     startdragx = x.invert(p[0])
            //     console.log('xaxis_drag', this, p, startdragx);
            // }
            var field, field2;
            var width = 1, height = 1;

            var draw = function(){
                console.log('draw WTF?', scope.chart, scope.chart2);
                // TODO: SVG не масштабируется автоматически
                width = element[0].clientWidth - margin.left - margin.right;
                height = element[0].clientHeight - margin.top - margin.bottom;

                svg.attr('width', width + margin.left + margin.right)
                   .attr('height', height + margin.top + margin.bottom);

                svg.select('#line-gradient').attr('x2', width);
                svg.select('#line-gradient2').attr('x2', -width);

                plot.select('rect.helper')
                    .attr('width', width)
                    .attr('height', height);

                axisx.select('rect.helper')
                    .attr('y', height)
                    .attr('width', width);

                axisy.select('rect.helper')
                    .attr('height', height);

                axisy2.select('rect.helper')
                    .attr('x', width)
                    .attr('height', height);

                // var x = d3.scale.linear()
                //     .range([0, width]);
                if(!scope.data) return;
                var data = scope.data;
                field = scope.chart || 'vout';
                field2 = scope.chart2;       // TODO: убрать умолчание

                // var start = new Date('10/28/2013 00:00:00'),
                //     stop = new Date('10/28/2013 23:59:59');
                var start = new Date(data.min_hour * 3600 * 1000),
                    stop = new Date((data.max_hour+1) * 3600 * 1000);

                // console.log('timechart draw', scope.data, start, stop, field);

                x.domain([start, stop]) //.nice()
                    .range([0, width]);

                // y.domain(d3.extent(data.points, function(d) {
                //     return d[field];
                // }));
                var _min = (scope.min || '0.0') * 1.0;
                var _max = d3.max(data.points, function(d) {
                    return d[field];
                });
                if((_max - _min) <= 0.1) {
                    _max = _min + 1.0;
                }
                // Чуток растянем, для красоты
                y.domain([_min, _max + (_max - _min) * 0.05]);

                if(field2){
                    _max = d3.max(data.points, function(d) {
                        return d[field2];
                    });
                    if((_max - _min) <= 0.1) {
                        _max = _min + 1.0;
                    }
                    // Чуток растянем, для красоты
                    y2.domain([_min, _max + (_max - _min) * 0.05]);
                }

                xAxis.ticks((width / 120) | 0);
                xAxisD.ticks((width / 120) | 0);
                yAxis.ticks((height / 40) | 0).tickSize(-width+10);
                yAxis2.ticks((height / 40) | 0).tickSize(-width+10);

                // xAxisD.ticks((width / 120) | 0);

                // var days = moment.duration(moment(x.invert(width)) - moment(x.invert(0))).asDays();
                // console.log('days=', days);
                // xAxisD.ticks(d3.time.days, 1);

                y.range([height, 0]);
                y2.range([height, 0]);

                zoomend();
                // zoom.x(x); zoom.y(y);      // За основу берется zoomY
                // zoomX.x(x);
                // zoomY.y(y);
                // zoomY2.y(y2);
                // zoom.y(y);
                // if(scope.zoomY) zoom.y(y);// else zoom.y(null);
                    // .call(zoom);

                clip
                    // .attr("x", x(0))
                    // .attr("y", y(1))
                    // .attr("width", x(1) - x(0))
                    // .attr("height", y(0) - y(1));
                    // .attr('x', 0)
                    // .attr('y', 0)
                    .attr('width', width+6)
                    .attr('height', height+6);

                chart.select('rect.overlay').attr('width', width).attr('height', height);

                // Ось времени

                xaxis.attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis);

                xaxisD.attr('transform', 'translate(0,' + (height + 20) + ')')
                    .call(xAxisD);

                // Ось данных

                yaxis.call(yAxis);

                yaxis2.attr('transform', 'translate(' + width + ',0)')
                    .call(yAxis2);

                // График

                if(field){
                    chart.select('path.line')
                        .datum(data.points) //.transition()
                        .attr('d', line);
                }

                if(field2){
                    chart.select('path.line2')
                        .datum(data.points) //.transition()
                        .attr('d', line2);
                } else {
                    chart.select('path.line2')
                        .datum([]) //.transition()
                        .attr('d', line2);
                }

                // Проекции
                projectx
                    .attr('y2', height);

                projecty
                    .attr('x2', 0);

                projecty2
                    .attr('x2', width);

            };

            scope.hover = {
                i: 0,
                dt: 0,
                value: 0,
                value2: ''
            };

            function dot(){
                if(!scope.data) return;
                var data = scope.data.points;
                var point = data[scope.hover.i];
                if(!point) return;
                var cx = x(new Date(point.dt * 1000));
                var cy = y(data[scope.hover.i][field]);

                cursor
                    .attr('cx', cx)
                    .attr('cy', cy);

                projecty
                    .attr('x1', cx)
                    .attr('y1', cy)
                    .attr('y2', cy);

                if(field2){
                    var cy2 = y2(data[scope.hover.i][field2]);
                    cy = Math.min(cy, y2(data[scope.hover.i][field2]));
                    cursor2
                        .attr('cx', cx)
                        .attr('cy', cy2);

                    projecty2
                        .attr('x1', cx)
                        .attr('y1', cy2)
                        .attr('y2', cy2);
                }

                projectx
                    .attr('x1', cx)
                    .attr('y1', cy)
                    .attr('x2', cx);


            }

            function hover() {
                if(!scope.data) return;

                var data = scope.data.points;
                var mx = d3.mouse(plot[0][0]);
                var dx = x.invert(mx[0]);
                var i = bisect(data, dx.valueOf() / 1000);
                if((i>0) && (i<(data.length-1))) {
                    if( Math.abs(x(new Date(data[i].dt * 1000)) - mx[0]) >  Math.abs(x(new Date(data[i-1].dt * 1000)) - mx[0]) ) {
                        i = i - 1;
                    }
                }
                scope.hover.i = i;
                // console.log('hover', dx, i);
                // var
                if(!data[scope.hover.i]) return;
                scope.$apply(function(){

                    scope.hover.dt = data[scope.hover.i].dt;
                    scope.hover.value = data[scope.hover.i][field];
                    if(field2){
                        scope.hover.value2 = data[scope.hover.i][field2];
                    } else {
                        scope.hover.value2 = '';
                    }
                });
                dot();
            }


            function zoomed() {
                zoomY2.scale(d3.event.scale).translate(d3.event.translate);

                xaxis.call(xAxis);
                xaxisD.call(xAxisD);
                yaxis.call(yAxis);
                yaxis2.call(yAxis2);
                chart.select('path.line')
                    .attr('d', line);
                chart.select('path.line2')
                    .attr('d', line2);

                dot();
            }

            function zoomedX() {
                xaxis.call(xAxis);
                xaxisD.call(xAxisD);
                chart.select('path.line')
                    .attr('d', line);
                chart.select('path.line2')
                    .attr('d', line2);

                dot();
            }

            function zoomedY() {
                yaxis.call(yAxis);
                chart.select('path.line')
                    .attr('d', line);

                dot();
            }

            function zoomedY2() {
                yaxis2.call(yAxis2);
                chart.select('path.line2')
                    .attr('d', line2);

                dot();
            }

            function zoomend() {
                zoom.x(x); zoom.y(y);       // Бля, почему это не пашет?
                zoomX.x(x);
                zoomY.y(y);
                zoomY2.y(y2);
            }


            // var resizebind =
            $(window).bind('resize', function(){
                // console.log('resize', element[0].clientWidth, element[0].clientHeight);
                draw();
            });

            scope.reZoom = draw;

            // scope.$on('$routeChangeSuccess', function() {
            //     console.log('on out');
            // });

            // scope.$destroy(function(){
            // })
            scope.$on('$destroy', function() {
                // console.log('on out', resizebind);
                // $(window).unbind(resizebind);
                $(window).unbind('resize');
            });

            scope.$watch('data', function(){
                draw();
            });

            scope.$watch('chart', function(){
                // console.log('chart', scope.chart);
                draw();
            });
            scope.$watch('chart2', function(){
                // console.log('chart', scope.chart);
                draw();
            });

            // scope.$watch('zoomY', function(){
            //     // console.log('zoomY', scope.zoomY);
            //     draw();
            //     // zoom.x(x);
            //     // if(scope.zoomY) zoom.y(y);
            // });

        };

        return {
            restrict: 'E',
            scope: {
                data: '=',
                chart: '@',
                chart2: '@',
                min: '@'
            },
            // template: '<svg width='500px' height='250px' class='chart'></svg>',
            template:
                '<div class="timechart">'+
                    '<div class="timechart-container"></div>'+
                    '<div class="timechart-control">'+
                        '<button class="btn" ng-click="reZoom()" title="Вернуть мастаб"><i class="icon-resize-full icon-2x"></i></button>' +
                        '<br/>' +
                        '{{ hover.dt | datetime:true:\'time\' }}<br>' +
                        '{{ hover.value | number:2  }} {{ hover.value2 | number:2  }}<br>' +
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

