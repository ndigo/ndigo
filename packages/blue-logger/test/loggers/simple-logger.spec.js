import { spy } from 'sinon';
import { Level } from '../../src/level';
import { SimpleLogger } from '../../src/loggers/simple-logger';

class SpyAppender {
    constructor(){
        this.name = 'spy';
        this.append = spy();
    }
}

describe( 'SimpleLogger', function(){

    test( 'it should create loggers', function(){
        const logger = new SimpleLogger( 'test' );
        expect( logger ).toBeInstanceOf( SimpleLogger );
    } );

    describe( 'instances', function(){
        const
            ONE    = new Level( 'one', 100 ),
            TWO    = new Level( 'two', 200 ),
            THREE  = new Level( 'three', 300 );
        let appender, logger;

        beforeEach( function(){
            appender = new SpyAppender();
            logger = new SimpleLogger( 'test', [ appender ] );
        } );

        afterEach( function(){
            appender = logger = undefined;
        } );

        test( 'it should compare levels', function(){
            expect( logger.compare( ONE, TWO ) ).toBe( -1 );
            expect( logger.compare( ONE, ONE ) ).toBe( 0 );
            expect( logger.compare( THREE, TWO ) ).toBe( 1 );
        } );

        test( 'it should manage appenders', function(){
            const
                appender2 = new SpyAppender(),
                appender3 = new SpyAppender();
            expect( logger.appenders.length ).toBe( 1 );
            logger.addAppender( appender2 );
            expect( logger.appenders.length ).toBe( 2 );
            logger.removeAppender( appender2 );
            expect( logger.appenders.length ).toBe( 1 );
            logger.removeAppender( appender3 );
            expect( logger.appenders.length ).toBe( 1 );
            logger.clearAppenders();
            expect( logger.appenders.length ).toBe( 0 );
        } );

        test( 'it should log entries using appenders', function(){
            logger.log( ONE, 'This is a one' );
            logger.log( TWO, 'This is a two' );
            logger.log( THREE, 'This is a three' );

            expect( appender.append.calledThrice ).toBe( true );

            const
                firstEntry = appender.append.getCall( 0 ).args[ 0 ],
                secondEntry = appender.append.getCall( 1 ).args[ 0 ],
                thirdEntry = appender.append.getCall( 2 ).args[ 0 ];

            expect( firstEntry.level.name ).toBe( 'one' );
            expect( secondEntry.level.name ).toBe( 'two' );
            expect( thirdEntry.level.name ).toBe( 'three' );
        } );
    } );
} );
