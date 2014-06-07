angular.module('resources.reports', ['resources.account', '$strap.directives', 'resources.geogps', 'resources.system', 'i18n'])

.factory('Reports', ['$location', 'Account', '$http', 'SERVER', 'GeoGPS', 'System', '$rootScope', '$filter', 'XLSX',
    function($location, Account, $http, SERVER, GeoGPS, System, $rootScope, $filter, XLSX) {
       'use strict';
        var humanizeMiliseconds = $filter ('humanizeMiliseconds');
        var Reports = {
          allReports: []
        };
        Reports.removeReport = function (report) {
            var index = Reports.allReports.indexOf (report);
            Reports.allReports.splice (index, 1); 
        };
        var arraySeparator = ',';
        Reports.dateToHours = function (d) {
            d.setHours (0);
            d.setMinutes (0);
            d.setSeconds (0);
            var hours = d.valueOf() / 1000 / 3600;
            return Math.floor(hours);// TODO: опасно!!!!!!!! дробные даты
        };
        Reports.hoursToDate = function (hours) {
            //var tz = (new Date ()).getTimezoneOffset () / 60;
            var d = new Date ((hours) * 60 * 60 * 1000);
            return d;
        };
        Reports.createUrl = function (skey, hoursStart, hoursStop, template) {
            var addParamToString = function (str, paramsName, params) {
                str += '&' + paramsName + '=';
                if (params.length > 0) {
                    str += params [0];
                    for (var i = 1; i < params.length; i++) {
                        str += arraySeparator + params [i];
                    }
                }
                
                return str;
            };
            var url = '?skey=' + skey + '&hStart=' + hoursStart + '&hStop=' + hoursStop;
            url = addParamToString (url, 'mE', template.mE);
            url = addParamToString (url, 'mD', template.mD);
            url = addParamToString (url, 'sE', template.sE);
            url = addParamToString (url, 'sD', template.sD);
            return url;
        };
        
        
        Reports.paramsToTemplate = function (mEStr, mDStr, sEStr, sDStr) {
            var paramsStrToArray = function (str) {
                var templateParams = str.split (arraySeparator);
                return templateParams;
            };
            var mE = paramsStrToArray (mEStr);
            var mD = paramsStrToArray (mDStr);
            var sE = paramsStrToArray (sEStr);
            var sD = paramsStrToArray (sDStr);
            return {mE: mE, mD: mD, sE: sE, sD: sD};
        };
        
        Reports.getEmptySingleReport = function (skey, hStart, hStop, template) {
            var report = {
                interval: {
                    hStart: hStart,
                    hStop: hStop
                },
                systemName: '',
                systemKey: skey,
                template: template,
                url: '',
                ready: false,
                reportData: {
                    mHeaders: [],
                    mRows: [],
                    sHeaders: [],
                    sRows: []
                }
            };  
            report.url = Reports.createUrl (skey, report.interval.hStart, report.interval.hStop, template);
            return report;
        };
        
        Reports.saveReport = function (report) {
            Reports.allReports.push (report);
        };
        
        Reports.getSingleReport = function (skey, hStart, hStop, template) {
            var report;
            var urlStr = Reports.createUrl (skey, hStart, hStop, template);
            for (var i = 0; i < Reports.allReports.length; i++) {
                if (Reports.allReports [i].url === urlStr) {
                    report = Reports.allReports [i];
                }
            }
            if (!report) {
                report = Reports.getEmptySingleReport (skey, hStart, hStop, template);
                
            }
            return report;
        };
        var getReportTables = function (report) {
            var row, line, i, j, str;
            var mHeaders = [$filter("translate")('event')];
            for (i = 0; i < report.reportData.mHeaders.length; i++) {
                str = $filter("translate")(report.reportData.mHeaders [i]);
                mHeaders.push (str);
            }
            var mainReport = [mHeaders];
            for (i = 0; i < report.reportData.mRows.length; i++) {
                row = report.reportData.mRows [i];
                if (row.type == 'separator') {
                    line = [{
                        colSpan: report.reportData.mHeaders.length + 1,
                        value: row.columns [0]
                    }];
                } else {
                    str = $filter("translate")(row.event);
                    line = [str];
                    for (j = 0; j < row.columns.length; j++) {
                        line.push (row.columns [j]);
                    }
                }
                mainReport.push (line);
            }
            
            var sHeaders = [$filter("translate")('Controlled parameters')];
            for (i = 0; i < report.reportData.sHeaders.length; i++) {
                str = $filter("translate")(report.reportData.sHeaders [i]);
                sHeaders.push (str);
            }
            var summaryReport = [sHeaders];
            
            for (i = 0; i < report.reportData.sRows.length; i++) {
                row = report.reportData.sRows [i];
                str = $filter("translate")(row.event);
                line = [str];
                for (j = 0; j < row.columns.length; j++) {
                    line.push (row.columns [j]);
                }
                summaryReport.push (line);
            }
            return {mainReport: mainReport, summaryReport: summaryReport};
        };
        var doubleArrayToCSV = function (arr) {
            var csv = "";
            var sep = "";
            for (var i = 0; i < arr.length; i++) {
                sep = "";
                for (var j = 0; j < arr [i].length; j++) {
                    csv += sep + arr [i][j];
                    sep = ";";
                }
                csv += "\n";
            }
            return csv;
        };
        var getPDFDownloadLink = function () {
            //TODO: проблемы с русской кодировкой...
            /*var doc = new jsPDF ();
            // We'll make our own renderer to skip this editor
            var specialElementHandlers = {
                '#downloadLink': function(element, renderer){
                    return true;
                }
            };
            
            // All units are in the set measurement for the document
            // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
            var renderEl = $('#report');
            doc.fromHTML(renderEl.get(0), 15, 15, {
                'width': 170, 
                'elementHandlers': specialElementHandlers
            });
            doc.save('Test.pdf');*/
        };
        var getCSVDownloadLink = function (reportTables) {
            //var fullReportCSV = "data:text/csv;charset=utf-8,";
            var fullReportCSV = "\uFEFF"; //Необходим что бы JavaScript определял текст как UTF8 with BOM
            var mainReportCSV = doubleArrayToCSV (reportTables.mainReport);
            var summaryReportCSV = doubleArrayToCSV (reportTables.summaryReport);
            
            fullReportCSV += mainReportCSV;
            fullReportCSV += "\n\n\n\n\n\n\n\n\n";
            fullReportCSV += summaryReportCSV;
            
            var URL = window.URL || window.webkiURL;
            var blob = new Blob([fullReportCSV],{type:"text/plain;charset=UTF-8"});
            var url = URL.createObjectURL(blob);
            //var url = encodeURI(fullReportCSV);
            return url;
        };
        var getXLSXDownloadLink = function (reportTables) {     
            var sheet = xlsx({
                worksheets: [{
                    data: reportTables.mainReport || [],
                    name: $filter("translate")('Main report')
                }, {
                    data: reportTables.summaryReport || [],
                    name: $filter("translate")('Summary report')
                }]
            });
        
            // data URI
            return sheet.href();
        };
        Reports.getReportInterval = function (report) {
            var startDay = Reports.hoursToDate (report.interval.hStart);
            var stopDay = Reports.hoursToDate (report.interval.hStop);
            var interval = {
                start: moment (startDay).format ('DD/MM/YYYY'),
                stop: moment (stopDay).format ('DD/MM/YYYY')
            };
            return interval;
        };
        Reports.getSingleReportDowloadData = function (report) {
            var interval = Reports.getReportInterval (report);
            var fileName = report.systemName + '_' + interval.start + '_' + interval.stop;
            var reportTables = getReportTables (report);
            var link = getXLSXDownloadLink (reportTables);
            var CSVlink = getCSVDownloadLink (reportTables);
            var PDFlink = getPDFDownloadLink ();
            return { fileName: fileName + '.xlsx', link: link, CSVfileName: fileName + '.csv', CSVlink: CSVlink, PDFfileName: fileName + '.pdf', PDFlink: PDFlink};
        };
        Reports.downloadReport = function (report) {
            var data = Reports.getSingleReportDowloadData (report);
            var link = $('<a />');
            link.attr ('href', data.link);
            link.attr ('download', data.fileName);
            link [0].click ();
        };
        
        Reports.completeSingleReport = function (report) {
            if (report.ready)
                return;
            
            var geocoder = new google.maps.Geocoder();
            var formatPosition = function (report, index, coordinatesIndex) {
                if (index === report.reportData.mRows.length || report.reportData.mRows.length === 0) {
                    report.reportData.addressesIsReady = true;
                    report.dowloadData = Reports.getSingleReportDowloadData (report);
                    return;
                }
                var eventType = report.reportData.mRows [index].event;
                if (eventType === 'm') {
                    formatPosition (report, index + 1, coordinatesIndex);
                    return;
                }
                geocoder.geocode({
                        'latLng': new google.maps.LatLng (report.reportData.mRows [index].data.start.lat, report.reportData.mRows [index].data.start.lon)
                    },
                    function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var address = '';
                            var parts = results [0].address_components;
                            var sep = "";
                            var types = {
                                country :'',                //страна
                                locality:'',                //город
                                //sublocality :'',
                                street_number:'',           //номер дома
                                //establishment:'',
                                route:'',                   //улица
                                /*postal_code:'',
                                administrative_area_level_1:'',
                                administrative_area_level_2:'',
                                administrative_area_level_3:''*/
                            };
                            for (var i = parts.length - 1; i >= 0; --i) {
                                if (parts [i].types[0] in types) {
                                    address += sep + parts [i].long_name;
                                    sep = ", ";
                                }
                            }
                            var item = report.reportData.mRows [index].columns [coordinatesIndex] = address;
                            setTimeout(function() {
                                formatPosition (report, index + 1, coordinatesIndex);
                            }, 1100);
    
                        } else {
                            //console.log ('formatPosition --> MARK_6');
                            //повторно запросить
                            setTimeout(function() {
                                formatPosition (report, index, coordinatesIndex);
                            }, 2000);
                        }
                    });
            };
            var convertCoordinatesToAdresses = function (report) {
                var coordinatesIndex = -1;
                for (var i = 0; i < report.template.mE.length; i++) {
                    if (report.template.mD [i] === 'c') {
                        coordinatesIndex = i;
                        break;
                    }
                }
                if (coordinatesIndex >= 0) {
                    formatPosition   (report, 0, coordinatesIndex);
                }
            };
            var pointToPointDistance = function (p1, p2) {
                return GeoGPS.distance (p1, p2);
            };
            
            var getPointsInterval = function (p1, p2, report) {
                var includeDate = (report.interval.hStop - report.interval.hStart > 23);
                var format = (includeDate) ? 'DD/MM HH:mm' : 'HH:mm';
                return moment (new Date (p1.dt * 1000)).format (format) + ' - ' + moment (new Date (p2.dt * 1000)).format (format);
            };
            
            var getRangeDuration = function (range) {
                return (range.stop.dt - range.start.dt) * 1000;
            };
            
            var getMaxSpeedFromIntervalPoints = function (points, startIndex, stopIndex) {
                var maxSpeed = 0;
                for (var i = startIndex; i <= stopIndex; i++) {
                    if (points [i].speed > maxSpeed) {
                        maxSpeed = points [i].speed;   
                    }
                }
                return maxSpeed;
            };
            var calculateFuelLevel = function (ranges, rangeIndex, points, systemParams) {
                var eventType = getEventTypeStr (ranges, rangeIndex, points, systemParams);
                var range = ranges [rangeIndex];
                var fuelLevel = 0;
                if (eventType === 's' || eventType === 'ss') {
                    var tmp = 0;
                    for (var i = range.start_index; i < range.stop_index; i++) {
                        tmp += points [i].fuel;
                    }
                    fuelLevel = tmp / (range.stop_index - range.start_index);
                } else {
                    fuelLevel = ranges [rangeIndex].stop.fuel;
                }
                return fuelLevel;
            };
            var calculateFuelChanges = function (ranges, rangeIndex, points, systemParams) {
                var prevFuelLevel = 0;
                if (rangeIndex > 0)
                    prevFuelLevel = calculateFuelLevel(ranges, rangeIndex - 1, points, systemParams);
                var nextFuelLevel = 0;
                var nextEventType = getEventTypeStr (ranges, rangeIndex, points, systemParams);
                if (rangeIndex < ranges.length - 1 && (nextEventType === 's' || nextEventType === 'ss'))
                    nextFuelLevel = calculateFuelLevel(ranges, rangeIndex + 1, points, systemParams);
                else
                    nextFuelLevel = calculateFuelLevel(ranges, rangeIndex, points, systemParams);
                
                var fuelChanges = 0;
                fuelChanges = nextFuelLevel - prevFuelLevel;
                return fuelChanges;
                
                /*
                var range = ranges [rangeIndex];
                var startIntervalFuel = 0;//range.start.fuel;
                var endIntervalFuel = 0;//range.stop.fuel;
                var pointsCount = (range.stop_index - range.start_index) > 30 ? 10 : 1; 
                for (var i = range.start_index; i < range.start_index + pointsCount; i++) {
                    startIntervalFuel += points [i].fuel;
                }
                startIntervalFuel /= pointsCount;
                for (i = range.stop_index; i > range.stop_index - pointsCount; i--) {
                    endIntervalFuel += points [i].fuel;
                }
                endIntervalFuel /= pointsCount;
                fuelChanges = endIntervalFuel - startIntervalFuel;
                return fuelChanges;
                */
            };
            var calculateFuelChanges_analytically = function (ranges, rangeIndex, points, systemParams) {
                var eventType, fuelConsumption = 0;
                eventType = getEventTypeStr (ranges, rangeIndex, points, systemParams);
                if (eventType === 'm') {
                    var speed = calculateAverageSpeed (ranges, rangeIndex, points, systemParams);
                    var distance = calculateTravelDistance (ranges, rangeIndex, points, systemParams);
                    var coef = systemParams.fuelan.getCoef (speed);
                    fuelConsumption += (distance / 100) * systemParams.fuelan.middle * coef;
                } else if (eventType === 'ss') {
                    var ssTime = getRangeDuration (ranges [rangeIndex]);
                    fuelConsumption = systemParams.fuelan.stop * (ssTime / 1000 / 60 / 60);
                }
                return fuelConsumption;
            };
            var calculateDuration = function (ranges, rangeIndex, points, systemParams) {
                return humanizeMiliseconds (getRangeDuration (ranges [rangeIndex]));
                //return moment.duration (getRangeDuration (ranges [rangeIndex])).humanize (); 
            };
            var calculateAverageSpeed = function (ranges, rangeIndex, points, systemParams) {
                var rangeDuration = getRangeDuration (ranges [rangeIndex]);
                var distance = calculateTravelDistance (ranges, rangeIndex, points, systemParams);
                var averageSpeed = distance / (rangeDuration / 1000 / 60 / 60);
                return averageSpeed;
            };
            var calculateTravelDistance = function (ranges, rangeIndex, points, systemParams) {
                var travelDistance = 0;
                var startIndex = ranges [rangeIndex].start_index;
                var stopIndex = ranges [rangeIndex].stop_index;
                var p1, p2;
                for (var i = startIndex; i < stopIndex; i++) {
                    p1 = points [i];
                    p2 = points [i + 1];
                    travelDistance += pointToPointDistance (p1, p2);
                }
                return travelDistance;
            };
            var getEventTypeStr = function (ranges, rangeIndex, points, systemParams) {
                if (!ranges || rangeIndex < 0 || rangeIndex >= ranges.length)
                    return undefined;
                var range = ranges [rangeIndex];
                return range.eventTypeStr || undefined;
            };
            var getCoordinates = function (ranges, rangeIndex, points) {
                var item = ranges [rangeIndex].start;
                return Math.floor (item.lat * 1000000) / 1000000 + ',' + Math.floor(item.lon * 1000000) / 1000000;
            };
            var getIntervalStr = function (ranges, rangeIndex, points, systemParams, report) {
                return getPointsInterval (ranges [rangeIndex].start, ranges [rangeIndex].stop, report);
            };
            var skipMainRow = function (row, template) {
                var skip = true;
                var eventTypeStr = row.eventTypeStr;
                for (var i = 0; i < template.mE.length; i++) {
                    if (eventTypeStr === template.mE [i]) {
                        skip = false;
                        break;
                    }
                }
                return skip;
            };
            var getMainHeaders = function (template, systemParams) {
                var headers = [];
                for (var i = 0; i < template.mD.length; i++) {
                    var str = template.mD [i];
                    if (!systemParams.hasFuelSensor && (str === 'fL' || str === 'cFL')) {
                        continue;
                    }
                        headers.push (str);
                }
                return headers;
            };
            
            var getFullMainRow = function (ranges, rangeIndex, points, systemParams, report) {
                var row_fullData = {};
                row_fullData.eventTypeStr = getEventTypeStr (ranges, rangeIndex, points, systemParams);
                row_fullData.fuelChanges_analytically = calculateFuelChanges_analytically (ranges, rangeIndex, points, systemParams);
                row_fullData.fuelChanges = calculateFuelChanges (ranges, rangeIndex, points, systemParams);
                row_fullData.duration = calculateDuration (ranges, rangeIndex, points, systemParams);
                row_fullData.fuelLevel = calculateFuelLevel (ranges, rangeIndex, points, systemParams);
                row_fullData.coordinates = getCoordinates (ranges, rangeIndex, points, systemParams);
                row_fullData.averageSpeed = calculateAverageSpeed (ranges, rangeIndex, points, systemParams);
                row_fullData.travelDistance = calculateTravelDistance (ranges, rangeIndex, points, systemParams);
                row_fullData.interval = getIntervalStr (ranges, rangeIndex, points, systemParams, report);
                row_fullData.range = ranges [rangeIndex];
                return row_fullData;
            };
            var concatMainRows = function (row2, row1, report) {
                var newRow = {};
                if (row1.eventTypeStr === 'ss' && row2.eventTypeStr === 'm') {
                    newRow.fuelChanges = row2.fuelChanges;
                    newRow.eventTypeStr = 'm';
                } else if (row2.eventTypeStr === 'ss' && row1.eventTypeStr === 'm') {
                    newRow.fuelChanges = row1.fuelChanges;
                    newRow.eventTypeStr = 'm';
                } else {
                    newRow.fuelChanges = row1.fuelChanges + row2.fuelChanges;
                    newRow.eventTypeStr = row2.eventTypeStr;
                }
                newRow.fuelChanges_analytically = row1.fuelChanges_analytically + row2.fuelChanges_analytically;
                var duration_milisec = (row1.range.stop.dt - row2.range.start.dt) * 1000;
                newRow.duration = humanizeMiliseconds (duration_milisec);  //moment.duration (duration_milisec).humanize ();
                newRow.fuelLevel = '';
                newRow.coordinates = '';
                newRow.travelDistance = (row2.travelDistance + row1.travelDistance);
                newRow.averageSpeed = newRow.travelDistance / (duration_milisec / 1000 / 60 / 60);
                newRow.interval = getPointsInterval (row2.range.start, row1.range.stop, report);
                var newRange = {};
                newRange.start = row2.range.start;
                newRange.stop = row1.range.stop;
                newRange.start_index = row2.range.start_index;
                newRange.stop_index = row1.range.stop_index;
                newRange.type = row1.type;
                newRow.range = newRange;
                return newRow;
            };
            var adaptMainDataToEvent = function (fullRow, systemParams) {
                var eventType = fullRow.eventTypeStr;
                if (eventType === 'm') {
                    fullRow.coordinates = '';
                    fullRow.fuelChanges_analytically = Math.round (fullRow.fuelChanges_analytically * 100) / 100;
                    fullRow.fuelLevel = '';
                    fullRow.fuelChanges = '';
                    fullRow.averageSpeed = Math.round (fullRow.averageSpeed * 10) / 10;
                    fullRow.travelDistance = Math.round (fullRow.travelDistance * 100) / 100;
                } else {
                    fullRow.averageSpeed = '';
                    fullRow.travelDistance = '';
                    fullRow.fuelChanges_analytically = '';
                }
                if (eventType === 's' || eventType === 'ss') {
                    fullRow.fuelChanges = '';
                }
            };
            var getMainRow = function (row_fullData, template, systemParams) {
                adaptMainDataToEvent (row_fullData, systemParams);
                var row = {event: row_fullData.eventTypeStr, columns:[], data: row_fullData.range};
                for (var i = 0; i < template.mD.length; i++) {
                    switch (template.mD [i]) {
                        case 'c': row.columns.push (row_fullData.coordinates); break;
                        case 'i': row.columns.push (row_fullData.interval); break;
                        case 'cFLa': row.columns.push (row_fullData.fuelChanges_analytically.toLocaleString()); break;
                        case 'cFL': if (systemParams.hasFuelSensor) row.columns.push (row_fullData.fuelChanges.toLocaleString()); break;
                        case 'fL': if (systemParams.hasFuelSensor) row.columns.push (row_fullData.fuelLevel.toLocaleString()); break;
                        case 'd': row.columns.push (row_fullData.duration); break;
                        case 'aS': row.columns.push (row_fullData.averageSpeed.toLocaleString()); break;
                        case 'dT': row.columns.push (row_fullData.travelDistance.toLocaleString()); break;
                        default: continue;
                    }
                }
                return row;
            };
            
            var getRangeEventTypeStr = function (range, points, systemParams) {
                var eventTypeStr;
                if (GeoGPS.isStop (range.start)) {
                    var duration = getRangeDuration (range);
                    
                    if (duration < systemParams.stopTime) 
                        eventTypeStr = 'ss';   
                    else 
                        eventTypeStr = 's';
                    if (systemParams.hasFuelSensor) {
                        var fDDifference = (systemParams.fDDifference || 10) * -1;
                        var reDifference = systemParams.reDifference || 10;
                        var startStopDt = range.stop.dt - range.start.dt;
                        var fuelDifference = (range.stop.fuel - range.start.fuel);
                        if (fuelDifference > reDifference) {
                            eventTypeStr = 're';
                        } else if (fuelDifference < fDDifference) {
                            eventTypeStr = 'fD';
                        }
                    }
                } else
                  eventTypeStr = 'm';
                range.eventTypeStr = eventTypeStr;
                return eventTypeStr;
            };
            
            //разделяет один интервал на несколько если он содержит подинтервалы (сливы или заправки)
            var splitTrackRange = function (range, points, systemParams) {
                var rangesArr = [];
                if (systemParams.hasFuelSensor && GeoGPS.isStop (range.start)) {
                    var tmpRange = range;
                    var fDDifference = (systemParams.fDDifference || 10) * -1;
                    var reDifference = systemParams.reDifference || 10;
                    for (var i = range.start_index + 1; i < range.stop_index; i++) {
                        var fuelDifference = points[i].fuel - points[i - 1].fuel;
                        if (fuelDifference > reDifference || fuelDifference < fDDifference) {
                            var prevRange = angular.copy (tmpRange);
                            prevRange.stop_index = i - 1;
                            prevRange.stop = points [prevRange.stop_index];
                            prevRange.eventTypeStr = getRangeEventTypeStr (prevRange, points, systemParams);
                            rangesArr.push (prevRange);
                            var newRange = angular.copy (tmpRange);
                            newRange.start_index = i - 1;
                            newRange.start = points [newRange.start_index];
                            newRange.stop_index = i;
                            newRange.stop = points [newRange.stop_index];
                            newRange.eventTypeStr = getRangeEventTypeStr (newRange, points, systemParams);
                            rangesArr.push (newRange);
                            tmpRange.start_index = i;
                            tmpRange.start = points [tmpRange.start_index];
                        }
                    }
                    tmpRange.eventTypeStr = getRangeEventTypeStr (tmpRange, points, systemParams);
                    rangesArr.push (tmpRange);
                } else {
                    range.eventTypeStr = getRangeEventTypeStr (range, points, systemParams);
                    rangesArr.push (range);
                }
                return rangesArr;
            };
            
            var checkAndCorrectTrackRanges = function (track, systemParams) {
                var newRanges = [];
                for (var i = 0; i < track.ranges.length; i++) {
                    var tmpArr = splitTrackRange (track.ranges [i], track.points, systemParams);
                    for (var j = 0; j < tmpArr.length; j++)
                        newRanges.push (tmpArr [j]);
                }
                track.ranges = newRanges;
                
            };
            
            
            
            var sys = System.get (report.systemKey);

            sys.then (function (sys) {
                report.system = sys;
                report.systemName = sys.title;
                GeoGPS.select (report.systemKey);
                var data = GeoGPS.getTrack (report.interval.hStart, report.interval.hStop);
                data.then (function (track) {
                    report.reportData.mHeaders = [];
                    report.reportData.mRows = [];
                    report.reportData.sHeaders = [];
                    report.reportData.sRows = [];
                    var mHeaders = [];
                    var mRows = [];
                    var sHeaders = [];
                    var sRows = [];
                    if (!track || !track.points || track.points.length === 0) {
                        report.ready = true;
                        return;
                    } 
                    var template = report.template;
                    var systemParams = report.system.params;
                    if(!systemParams.fuelan) {
                        systemParams.fuelan = {
                            middle: 10,
                            stop: 1.2,
                            corr: [
                                {speed: 5, value: 3.2},
                                {speed: 30, value: 1.6},
                                {speed: 60, value: 1.0},
                                {speed: 90, value: 0.8},
                                {speed: 120, value: 1.0},
                                {speed: 150, value: 1.26},
                                {speed: 180, value: 1.6}
                            ]
                        };
                    }
                    // на всякий случай сортируем по возростанию скорости
                    systemParams.fuelan.corr.sort (function(obj1, obj2) {
                      if (obj1.speed < obj2.speed) return -1;
                      if (obj1.speed > obj2.speed) return 1;
                      return 0;
                    });
                    systemParams.fuelan.getCoef = function (speed) {
                        var corr = systemParams.fuelan.corr;
                        var coef = corr [corr.length - 1].value,
                            intervalStart, intervalStop;
                        for (var i = 0; i < corr.length - 1; i++) {
                            intervalStart = corr [i];
                            intervalStop = corr [i + 1];
                            if (intervalStart.speed > speed) {
                                coef = intervalStart.value;
                                break;
                            } else if (intervalStop.speed > speed) {
                                var first = speed - intervalStart.speed;
                                var second = intervalStop.speed - speed;
                                var total = intervalStop.speed - intervalStart.speed;
                                coef = (1 - first / total) * intervalStart.value + (1 - second / total) * intervalStop.value;
                                break;
                            }
                        }
                        return coef;
                    };
                    systemParams.hasFuelSensor = report.system.car.hasFuelSensor;
                    systemParams.fDDifference = report.system.car.fDDifference;
                    systemParams.reDifference = report.system.car.reDifference;
                    systemParams.stopTime = (report.system.car.stop | 3) * 60 * 1000;
                    mHeaders = getMainHeaders (template, systemParams);
                    sHeaders = angular.copy (template.sD);
                    
                    //Здесь выполняется переразбиение промежутков с учетом сливов и заправок
                    checkAndCorrectTrackRanges (track, systemParams);
                    
                    var ranges = track.ranges;
                    var item, i;
                    var points = track.points;
                    report.reportData.points = points;
                    var rows_fullData = [];
                    var row_fullData, prevMainRow;
                    for (i = 0; i < ranges.length; i++) {
                        row_fullData = getFullMainRow (ranges, i, points, systemParams, report);
                        rows_fullData.push (row_fullData);
                    }
                    
                    for (i = 0; i < rows_fullData.length; i++) {
                        row_fullData = rows_fullData [i];
                        if ((prevMainRow && prevMainRow.eventTypeStr === 'm' && row_fullData.eventTypeStr === 'ss') || !skipMainRow (row_fullData, template)) {
                            /*var row = getMainRow (row_fullData, template, systemParams);
                                row.data = row_fullData.range;
                                mRows.push (row);*/
                            if (prevMainRow && prevMainRow.eventTypeStr === 'm' &&
                                (row_fullData.eventTypeStr === 'm' || row_fullData.eventTypeStr === 'ss')) {
                                //console.log ('full main row concatted!! prevMainRow : ', prevMainRow, ' currentMainRow : ', row_fullData);
                                row_fullData = concatMainRows (prevMainRow, row_fullData, report);
                            } else if (prevMainRow) {
                                mRows.push (getMainRow (prevMainRow, template, systemParams));
                            }
                            prevMainRow = row_fullData;
                        }
                    }
                    
                    if (prevMainRow && !skipMainRow (prevMainRow, template)) {
                        var row = getMainRow (prevMainRow, template, systemParams);
                        mRows.push (row);
                    }
                        
        ////////////////// SUMMARY REPORT
           
                    var calculateTotalTraveledDistance = function (ranges, points, systemParams) {
                        var totalDistance = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 'm') 
                                totalDistance += calculateTravelDistance (ranges, i, points, systemParams);
                        }
                        return Math.round (totalDistance * 10) / 10;
                    };
                    var calculateTotalTraveledTime = function (ranges, points, systemParams) {
                        var totalTime = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 'm' || eventStr === 'ss')
                                totalTime += getRangeDuration (ranges [i]);
                        }
                        return totalTime;
                    };
                    var calculateTotalStopedTime = function (ranges, points, systemParams) {
                        var totalTime = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 's') {
                                totalTime += getRangeDuration (ranges [i]);
                            }
                        }
                        return totalTime;
                    };
                    var calculateMaxSpeed = function (ranges, points, systemParams) {
                        var maxSpeed = 0, tmp = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 'm') {
                                tmp = getMaxSpeedFromIntervalPoints (points, ranges [i].start_index, ranges [i].stop_index);
                                if (tmp > maxSpeed) {
                                    maxSpeed = tmp;   
                                }
                            }
                        }
                        return maxSpeed;
                    };
                    var calculateTotalAverageSpeed = function (ranges, points) {
                        var totalTime = calculateTotalTraveledTime (ranges, points, systemParams);
                        if (totalTime === 0)
                            return 0;
                        var totalDistance = calculateTotalTraveledDistance (ranges, points, systemParams);
                        var totalAverageSpeed = totalDistance / (totalTime / 1000 / 60 / 60);
                        return Math.round (totalAverageSpeed * 10) / 10;
                    };
                    var calculateFuelConsumption_sensor = function (ranges, points, systemParams) {
                        var fuelConsumption = 0;
                        var startRangeFule = calculateFuelLevel (ranges, 0, points, systemParams);
                        var endRangeFuel = calculateFuelLevel (ranges, ranges.length - 1, points, systemParams);
                        fuelConsumption = startRangeFule - endRangeFuel;
                        for (var i = 0; i < ranges.length; i++) {
                            var eventType = getEventTypeStr (ranges, i, points, systemParams);
//                            if (eventType === 'm')
//                                fuelConsumption += calculateFuelChanges (ranges, i, points, systemParams);
                            if (eventType === 're')
                                fuelConsumption += calculateFuelChanges (ranges, i, points, systemParams);
                            else if (eventType === 'fD')
                                fuelConsumption -= calculateFuelChanges (ranges, i, points, systemParams);
                        }
                        return Math.round (fuelConsumption * 10) / 10;
                    };
                    var calculateFuelConsumption_analytically = function (ranges, points, systemParams) {
                        var fuelConsumption = 0;
                        for (var i = 0; i < ranges.length; i++) {
                            fuelConsumption += calculateFuelChanges_analytically (ranges, i, points, systemParams);
                        }
                        return Math.round (fuelConsumption * 10) / 10;
                    };
                    var calculateTotalDrainFuel = function (ranges, points, systemParams) {
                        var fuelDrain = 0;
                        for (var i = 0; i < ranges.length; i ++) {
                            var eventType = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventType === 'fD')
                                fuelDrain += calculateFuelChanges (ranges, i, points, systemParams);
                        }
                        return fuelDrain;
                    };
                    var calculateTotalRefueling = function (ranges, points, systemParams) {
                        var fuelRefuling = 0;
                        for (var i = 0; i < ranges.length; i ++) {
                            var eventType = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventType === 're')
                                fuelRefuling += calculateFuelChanges (ranges, i, points, systemParams);
                        }
                        return fuelRefuling;
                    };
    
                    var getSummaryRow = function (event, systemParams) {
                        var sRow;
                        var createRow = function (event, value) {
                          return {event: event, columns: [value]};  
                        };
                        switch (event) {
                            case  'dT': sRow = createRow (event, summary_row_full.totalTraveledDistance); break;
                            case  'tTT': sRow = createRow (event, summary_row_full.totalTraveledTime); break;
                            case  'aS': sRow = createRow (event, summary_row_full.totalAverageSpeed); break;
                            case  'tTOPAS': sRow = createRow (event, summary_row_full.totalStopedTime); break;
                            case  'mS': sRow = createRow (event, summary_row_full.maxSpeed); break;
                            case  'fCs': if (systemParams.hasFuelSensor) sRow = createRow (event, summary_row_full.fuelConsumption_sensor); break;
                            case  'fCa': sRow = createRow (event, summary_row_full.fuelConsumption_analytically); break;
                            case  'tF': if (systemParams.hasFuelSensor) sRow = createRow (event, summary_row_full.totalRefueling); break;
                            case  'tDF': if (systemParams.hasFuelSensor) sRow = createRow (event, summary_row_full.totalDrainFuel); break;
                        }
                        return sRow;
                    };
                    var summary_row_full = [];
                    summary_row_full.totalTraveledDistance = calculateTotalTraveledDistance (ranges, points, systemParams).toLocaleString() + ' км';
                    summary_row_full.totalTraveledTime = humanizeMiliseconds (calculateTotalTraveledTime (ranges, points, systemParams));
                    summary_row_full.totalStopedTime = humanizeMiliseconds (calculateTotalStopedTime (ranges, points, systemParams));
                    summary_row_full.maxSpeed = Math.round (calculateMaxSpeed (ranges, points, systemParams)).toLocaleString() + ' км/ч';
                    summary_row_full.totalAverageSpeed = calculateTotalAverageSpeed (ranges, points, systemParams).toLocaleString() + ' км/ч';
                    summary_row_full.fuelConsumption_sensor = calculateFuelConsumption_sensor (ranges, points, systemParams).toLocaleString() + ' л';
                    summary_row_full.fuelConsumption_analytically = calculateFuelConsumption_analytically (ranges, points, systemParams).toLocaleString() + ' л';
                    summary_row_full.totalDrainFuel = calculateTotalDrainFuel (ranges, points, systemParams).toLocaleString() + ' л';
                    summary_row_full.totalRefueling = calculateTotalRefueling (ranges, points, systemParams).toLocaleString() + ' л';
                    for (i = 0; i < template.sE.length; i++) {
                        var sRow_final = getSummaryRow (template.sE [i], systemParams);
                        if (sRow_final) {
                            sRows.push (sRow_final);
                        }
                    }
                    report.reportData.mHeaders = mHeaders;
                    report.reportData.mRows = mRows;
                    report.reportData.sHeaders = sHeaders;
                    report.reportData.sRows = sRows;                
                    report.reportData.addressesIsReady = false;
                    report.reportData.track = track;
                    convertCoordinatesToAdresses (report);
                    report.dowloadData = Reports.getSingleReportDowloadData (report);
                    report.ready = true;
                    return report;
                });
            });
        };
        return Reports;
}]);