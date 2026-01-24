import { stub } from 'sinon';
import { Level } from '../../src/level';
import { BrowserConsoleAppender } from '../../src/appenders/browser-console-appender';

describe( 'BrowserConsoleAppender', function(){
    const
        ONE    = new Level( 'one'   , 100 ),
        TWO    = new Level( 'two'   , 200 ),
        THREE  = new Level( 'three' , 300 ),
        FOUR   = new Level( 'four'  , 400 );

    test( 'it should be a function', function(){
        expect( BrowserConsoleAppender ).toBeInstanceOf( Function );;
    } );

    test( 'it should make instances', function(){
        const appender = new BrowserConsoleAppender( 'test', {
            one  : 'debug',
            two  : 'info',
            three: 'warn',
            four : 'error'
        } );
        expect( appender ).toBeInstanceOf( BrowserConsoleAppender );
    } );

    context( 'instances', function(){
        const
            entryOne   = { level: ONE  , message: [ 'This', 'is', 'a', 'one'   ], timestamp: new Date( '1995-12-17T03:24:00' ).getTime(), category: 'appender.browserconsole.test.unit' },
            entryTwo   = { level: TWO  , message: [ 'This', 'is', 'a', 'two'   ], timestamp: new Date( '1995-12-17T03:24:00' ).getTime(), category: 'appender.browserconsole.test.unit' },
            entryThree = { level: THREE, message: [ 'This', 'is', 'a', 'three' ], timestamp: new Date( '1995-12-17T03:24:00' ).getTime(), category: 'appender.browserconsole.test.unit' },
            entryFour  = { level: FOUR , message: [ 'This', 'is', 'a', 'four'  ], timestamp: new Date( '1995-12-17T03:24:00' ).getTime(), category: 'appender.browserconsole.test.unit' };
        let appender;

        afterEach( function(){
            console.debug.restore();
            console.info.restore();
            console.warn.restore();
            console.error.restore();
            console.log.restore();
            appender = undefined;
        } );

        beforeEach( function(){
            stub( console, 'debug' );
            stub( console, 'info' );
            stub( console, 'warn' );
            stub( console, 'error' );
            stub( console, 'log' );
            appender = new BrowserConsoleAppender( {
                one  : 'debug',
                two  : 'info',
                three: 'warn',
                four : 'error'
            } );
        } );

        test( 'it should append an entry', function(){
            appender.append( entryOne );
            appender.append( entryTwo );
            appender.append( entryThree );
            appender.append( entryFour );
            expect( console.debug.called ).toBe( true );
            expect( console.info.called ).toBe( true );
            expect( console.warn.called ).toBe( true );
            expect( console.error.called ).toBe( true );
        } );
    } );
} );
