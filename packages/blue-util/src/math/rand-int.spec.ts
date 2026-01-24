import randInt from './rand-int';

describe( 'randInt', function(){

    test( 'it should generate numbers', function(){
        const
            one = randInt(),
            two = randInt();

        expect( one ).not.toBe( two );
        expect( one ).not.toBeUndefined();
        expect( one ).not.toBe( Infinity );
        expect( one ).not.toBe( NaN );

        expect( one ).toBeGreaterThan( Number.MIN_SAFE_INTEGER );
        expect( one ).toBeLessThan( Number.MAX_SAFE_INTEGER );
        expect( two ).toBeGreaterThan( Number.MIN_SAFE_INTEGER );
        expect( two ).toBeLessThan( Number.MAX_SAFE_INTEGER );
    } );

    test( 'returns a same number if mix/max are same', function(){
        const
            one = randInt( 1, 1 ),
            two = randInt( 1, 1 );

        expect( one ).toBe( two );
        expect( one ).not.toBeUndefined();
        expect( one ).not.toBe( Infinity );
        expect( one ).not.toBe( NaN );
    } );

    test( 'it should generate numbers between a range', function(){
        const
            one = randInt( 0, 9999 ),
            two = randInt( 0, 9999 );

        expect( one ).not.toBe( two );

        expect( one ).toBeGreaterThan( -0.01 );
        expect( one ).toBeLessThan( 9999.01 );
        expect( two ).toBeGreaterThan( -0.01 );
        expect( two ).toBeLessThan( 9999.01 );
    } );
} );
