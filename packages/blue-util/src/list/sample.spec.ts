import sample from './sample';

describe( 'sample', function(){

    test( 'it should sample', function(){
        const one = sample( 7, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );

        expect( one.length ).toBe( 7 );

        const two = sample( 5, one );

        expect( two.length ).toBe( 5 );

        const three = sample( 3, two );

        expect( three.length ).toBe( 3 );

        const four = sample( -7, three );

        expect( four.length ).toBe( 1 );
    } );

    test( 'it should curry', function(){
        const
            sampleFive = sample( 5 ),
            zero = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
            one = sampleFive( zero );

        expect( one.length ).toBe( 5 );
    } );
} );
