import { spy } from 'sinon';
import { Level } from '@blue/logger';
import { EventLogger } from '../src/event-logger';

describe( 'EventLogger', function(){

    test( 'it should create loggers', function(){
        const logger = new EventLogger( 'test' );
        expect( logger ).toBeInstanceOf( EventLogger );
    } );

    describe( 'instances', function(){
        const
            ONE    = new Level( 'one', 100 ),
            TWO    = new Level( 'two', 200 ),
            THREE  = new Level( 'three', 300 );
        let logger;

        beforeEach( function(){
            logger = new EventLogger( 'test' );
        } );

        afterEach( function(){
            logger = undefined;
        } );

        test( 'it should compare levels', function(){
            expect( logger.compare( ONE, TWO ) ).toBe( -1 );
            expect( logger.compare( ONE, ONE ) ).toBe( 0 );
            expect( logger.compare( THREE, TWO ) ).toBe( 1 );
        } );

        test( 'it should log entries using events', function(){
            const
                onLog = spy(),
                onOne = spy(),
                onTwo = spy(),
                onThree = spy();

            logger.on( 'log', onLog );
            logger.on( 'log:one', onOne );
            logger.on( 'log:two', onTwo );
            logger.on( 'log:three', onThree );

            logger.log( ONE, 'This is a one' );
            logger.log( TWO, 'This is a two' );
            logger.log( THREE, 'This is a three' );

            expect( onLog.calledThrice ).toBe( true );
            expect( onOne.calledOnce ).toBe( true );
            expect( onTwo.calledOnce ).toBe( true );
            expect( onThree.calledOnce ).toBe( true );
        } );
    } );
} );
