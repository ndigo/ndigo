import { Level } from '@blue/logger';
import { HTTPPostLayout } from '../../src/logger/http-post-layout';

describe( 'HTTPPostLayout', function(){
    test( 'it should be a function', function(){
        expect( HTTPPostLayout ).toBeInstanceOf( Function );;
    } );

    test( 'it should make instances', function(){
        const layout = new HTTPPostLayout();
        expect( layout ).toBeInstanceOf( HTTPPostLayout );
    } );

    context( 'instances', function(){
        const entry = { level: new Level( 'ONE', 100 ), message: [ 'This', 'is', 'a', 'test' ], timestamp: new Date( '1995-12-17T03:24:00' ).getTime(), category: 'layout.pattern.test.unit' };
        let layout;

        afterEach( function(){
            layout = undefined;
        } );

        test( 'it should format an entry', function(){
            layout = new HTTPPostLayout();
            expect( layout.format( entry ) ).to.match( /category=layout.pattern.test.unit&level=ONE&message=This%20is%20a%20test&timestamp=819188640000/ );
        } );
    } );
} );
