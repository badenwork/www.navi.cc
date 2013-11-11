'use strict';

/* jasmine specs for directives go here */

describe('app.services.imeicheck', function() {
    var imeicheck;

    beforeEach(module('app.services.imeicheck'));
    beforeEach(inject(function(_imeicheck_) {
        imeicheck = _imeicheck_;
    }));

    it('Только строки', function() {
        expect( imeicheck(0) ).toEqual(false);
        expect( imeicheck({}) ).toEqual(false);
    });

    it('Заведомо неправильный формат IMEI', function() {
        expect( imeicheck("Mix123") ).toEqual(false);
        expect( imeicheck("353358016975901-123-4") ).toEqual(false);
    });

    it('Заведомо правильный простой IMEI', function() {
        expect( imeicheck("013226000198214") ).toEqual(true);
        expect( imeicheck("013226002436422") ).toEqual(true);
        expect( imeicheck("353358016975901") ).toEqual(true);
        // IMEI, которые дали ошибку
        expect( imeicheck("013227006581171") ).toEqual(true);
        expect( imeicheck("013227006585198") ).toEqual(true);
        expect( imeicheck("013227006587749") ).toEqual(true);
        expect( imeicheck("013227006587087") ).toEqual(true);
    });

    it('Заведомо неправильный IMEI', function() {
        expect( imeicheck("01322600198214") ).toEqual(false);
        expect( imeicheck("013226000198215") ).toEqual(false);
        expect( imeicheck("01326000198214") ).toEqual(false);
        expect( imeicheck("0132260000198214") ).toEqual(false);
    });

    it('Заведомо правильный IMEI с кодом', function() {
        expect( imeicheck("013226000198214-1") ).toEqual(true);
        expect( imeicheck("013226002436422-12") ).toEqual(true);
        expect( imeicheck("353358016975901-123") ).toEqual(true);
        expect( imeicheck("353358016975901-1234") ).toEqual(true);
        expect( imeicheck("353358016975901-12345") ).toEqual(true);
    });

    it('Заведомо правильный IMEI с ошибкой в коде', function() {
        expect( imeicheck("013226000198214-") ).toEqual(false);
        expect( imeicheck("013226002436422-Mix4") ).toEqual(false);
        expect( imeicheck("353358016975901-123456") ).toEqual(false);
        expect( imeicheck("353358016975901-32768") ).toEqual(false);
        expect( imeicheck("353358016975901-0") ).toEqual(false);
    });

});
