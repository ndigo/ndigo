import { worker } from '../_worker';
import { Level } from '../../src/level';
import { FetchAppender } from '../../src/appenders/fetch-appender';

describe( 'FetchAppender', function(){
    before( () => worker.start( { quiet: true } ) );

    afterEach( function(){
        worker.resetHandlers();
    } );

    after( () => worker.stop() );

    test( 'it should make instances', function(){
        const appender = new FetchAppender( '/log/100' );
        expect( appender ).toBeInstanceOf( FetchAppender );
    } );

    context( 'instances', function(){
        const entry = { level: new Level( 'ONE', 100 ), message: [ 'This', 'is', 'a', 'test' ], timestamp: new Date( '1995-12-17T03:24:00' ).getTime(), category: 'layout.pattern.test.unit' };
        let appender;

        afterEach( function(){
            appender = undefined;
        } );

        test( 'it should append an entry', async function(){
            appender = new FetchAppender( '/log/100' );
            appender.append( entry );
            const response = await appender.appending;
            expect( response.status ).toBe( 200 );
            const result = await response.text();
            expect( result ).toBe( 'OK' );
        } );

        test( 'it should time out', async function(){
            appender = new FetchAppender( '/log/100', { timeout: 50 } );
            appender.append( entry );
            appender.appending.then( () => { throw new Error( 'Did not time out' ); } ).catch( function( error ){
                expect( error ).toBeInstanceOf( Error );
                expect( error.message ).to.match( /Appender timed out/ );
            } );
        } );
    } );
} );
