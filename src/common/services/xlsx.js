/* global angular:true, xlsx:true */

/*
    Маркеры последних известных положений ТС.
*/

angular.module('services.xlsx', [])

.factory('XLSX', [
    function() {
        'use strict';
        var XLSX = {
            cache: [] // Кеш отчетов?
        };

        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 1024;

            function charCodeFromCharacter(c) {
                return c.charCodeAt(0);
            }

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = Array.prototype.map.call(slice, charCodeFromCharacter);
                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, {type: contentType});
            return blob;
        }

        // Создание нового документы
        XLSX.document = function(name, worksheets) {
            this.name = name;
            var sheet = this.sheet = xlsx({
                creator: 'John Doe',
                lastModifiedBy: 'Meg White',
                worksheets: worksheets
            });
            // fs.writeFile(file, sheet.base64, 'base64', done);
            window.console.log('Create xlsx-document', sheet);

            var blob = b64toBlob(sheet.base64, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            // var blob = new Blob([sheet.base64], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

            var blobURL = URL.createObjectURL(blob);
            window.console.log("blob=", blob, blobURL);
            this.href = blobURL;
          // document.getElementById("download").href = blobURL;

        };

        XLSX.document.prototype.base64 = function(){
            return this.sheet.base64;
        };

        XLSX.document.prototype.url = function(){
            // return this.sheet.href();
            return this.href;
        };

        return XLSX;
    }

]);
