const { expect } = require( 'chai' );
const { spy } = require( 'sinon' );
import metadataManager, { MetadataScanner } from '../src/metadata-manager';

describe( 'metadataManager', function(){
    describe( 'MetadataScanner', function(){
        let metadataScanner,
            target;

        const Target = function Target(){};
        Target.prototype = Object.create( null );
        Target.prototype.constructor = Target;
        Target.prototype.handleEveryone = function(){};
        Target.prototype.handleWorld = function(){};

        beforeEach( function(){
            target = new Target();
            target.errorHandler = function(){};
            target.errorHandler2 = function(){};
        } );

        afterEach( function(){
            target = undefined;
            metadataScanner = undefined;
        } );

        test( 'it should be a class that returns an instance', function(){
            metadataScanner = new MetadataScanner();
            expect( MetadataScanner ).toBeInstanceOf( Function );;
            expect( metadataScanner ).to.be.an( 'object' );
            expect( metadataScanner ).to.respondTo( 'get' );
            expect( metadataScanner ).to.respondTo( 'clear' );
        } );

        test( 'it should populate an empty cache and then return the requested metadata', function(){
            Reflect.defineMetadata( 'request:mapping', true, Target.prototype, 'handleEveryone' );
            Reflect.defineMetadata( 'request:mapping', function(){}, Target.prototype, 'handleWorld' );

            metadataScanner = new MetadataScanner( Target.prototype );

            expect( metadataScanner._cache.size ).toBe( 0 );
            expect( metadataScanner.get( 'request:mapping' ) ).toEqual( [ 'handleEveryone', 'handleWorld' ] );
            expect( metadataScanner._cache.size ).toBe( 1 );
        } );

        test( 'it should prime the cache once with all the metadata defined on the target’s properties', function(){
            Reflect.defineMetadata( 'error:handler', 10, target, 'errorHandler' );
            Reflect.defineMetadata( 'error:handler', 'madeupvalue', target, 'errorHandler2' );
            Reflect.defineMetadata( 'different:metadata', 'anothermadeupcalue', target, 'errorHandler2' );

            metadataScanner = new MetadataScanner( target );
            expect( metadataScanner._cache.size ).toBe( 0 );

            // prime the cache by asking for one key
            metadataScanner.get( 'error:handler' );

            expect( metadataScanner._cache.size ).toBe( 2 );
            expect( metadataScanner.get( 'error:handler' ) ).toEqual( [ 'errorHandler', 'errorHandler2' ] );
            expect( metadataScanner._cache.size ).toBe( 2 );
            expect( metadataScanner.get( 'different:metadata' ) ).toEqual( [ 'errorHandler2' ] );
            expect( metadataScanner._cache.size ).toBe( 2 );
        } );

        test( 'it should return undefined if metadata isn’t in cache', function(){
            Reflect.defineMetadata( 'error:handler', false, target, 'errorHandler' );

            metadataScanner = new MetadataScanner( target );
            // prime the cache
            metadataScanner.get( 'error:handler' );

            expect( metadataScanner.get( 'it shouldnt:exist' ) ).toBeUndefined();
        } );

        test( 'it should clear the cache', function(){
            Reflect.defineMetadata( 'error:handler', false, target, 'errorHandler' );
            metadataScanner = new MetadataScanner( target );
            metadataScanner.get( 'error:handler' );

            expect( metadataScanner._cache.size ).toBe( 1 );
            metadataScanner.clear();
            expect( metadataScanner._cache.size ).toBe( 0 );
        } );
    } );

    let target,
        scannerMapGetSpy;

    beforeEach( function(){
        target = {};
        target.handleMapping = function(){};
        target.handleError = function(){};
        target.handleSurprise = function(){};
        scannerMapGetSpy = spy( metadataManager._scannerMap, 'get' );
    } );

    afterEach( function(){
        target = undefined;
        scannerMapGetSpy.restore();
    } );

    test( 'it should return undefined if metadata isn’t set anywhere in the object', function(){
        expect( metadataManager.get( target, 'doesnot:exist' ) ).toBeUndefined();
    } );

    test( 'it should return properties on an object that have metadata ', function(){
        Reflect.defineMetadata( 'request:mapping', true, target, 'handleMapping' );
        Reflect.defineMetadata( 'request:mapping', 10, target, 'handleSurprise' );
        Reflect.defineMetadata( 'error:handling', function(){}, target, 'handleError' );

        // add target object MetadataScanner to WeakMap
        expect( metadataManager.get( target, 'request:mapping' ) ).toEqual( [ 'handleMapping', 'handleSurprise' ] );
        expect( scannerMapGetSpy.callCount ).toBe( 0 );

        // get metadata properties from target object via WeakMap
        expect( metadataManager.get( target, 'error:handling' ) ).toEqual( [ 'handleError' ] );
        expect( scannerMapGetSpy.callCount ).toBe( 1 );
    } );
} );
