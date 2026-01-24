import rand from './rand';

describe( 'rand', function(){

    test( 'it should generate numbers', function(){
        const
            one = rand(),
            two = rand();

        expect( one ).not.toBe( two );

        expect( one ).toBeGreaterThan( Number.MIN_SAFE_INTEGER );
        expect( one ).toBeLessThan( Number.MAX_SAFE_INTEGER );
        expect( two ).toBeGreaterThan( Number.MIN_SAFE_INTEGER );
        expect( two ).toBeLessThan( Number.MAX_SAFE_INTEGER );
    } );

    test( 'it should generate numbers between a range', function(){
        const
            one = rand( 0, 9999 ),
            two = rand( 0, 9999 );

        expect( one ).not.toBe( two );
        expect( one ).not.toBeUndefined();
        expect( one ).not.toBe( Infinity );
        expect( one ).not.toBeNaN();

        expect( one ).toBeGreaterThan( -0.01 );
        expect( one ).toBeLessThan( 9999.01 );
        expect( two ).toBeGreaterThan( -0.01 );
        expect( two ).toBeLessThan( 9999.01 );
    } );
} );
