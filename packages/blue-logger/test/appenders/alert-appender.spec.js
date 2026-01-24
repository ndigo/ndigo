import { stub } from 'sinon';
import { Level } from '../../src/level';
import { AlertAppender } from '../../src/appenders/alert-appender';

describe( 'AlertAppender', function(){
    test( 'it should be a function', function(){
        expect( AlertAppender ).toBeInstanceOf( Function );;
    } );

    test( 'it should make instances', function(){
        const appender = new AlertAppender( 'test' );
        expect( appender ).toBeInstanceOf( AlertAppender );
    } );

    context( 'instances', function(){
        const entry = { level: new Level( 'ONE', 100 ), message: [ 'This', 'is', 'a', 'test' ], timestamp: new Date( '1995-12-17T03:24:00' ).getTime(), category: 'appender.alert.test.unit' };
        let appender;

        afterEach( function(){
            window.alert.restore();
            appender = undefined;
        } );

        beforeEach( function(){
            stub( window, 'alert' );
        } );

        test( 'it should append an entry', function(){
            appender = new AlertAppender();
            appender.append( entry );
            expect( window.alert.calledOnce ).toBe( true );
        } );
    } );
} );
