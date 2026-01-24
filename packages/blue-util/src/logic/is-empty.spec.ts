import isEmpty from './is-empty';

describe( 'isEmpty', function(){
    test( 'returns false for null', function(){
        expect( isEmpty( null ) ).toBe( false );
    } );

    test( 'returns false for undefined', function(){
        expect( isEmpty( undefined ) ).toBe( false );
    } );

    test( 'returns true for empty string', function(){
        expect( isEmpty( '' ) ).toBe( true );
        expect( isEmpty( ' ' ) ).toBe( false );
    } );

    test( 'returns true for empty array', function(){
        expect( isEmpty( [] ) ).toBe( true );
        expect( isEmpty( [ [] ] ) ).toBe( false );
    } );

    test( 'returns true for empty typed array', function(){
        expect( isEmpty( Uint8Array.from( '' as Iterable<number> ) ) ).toBe( true );
        expect( isEmpty( Float32Array.from( '' as Iterable<number> ) ) ).toBe( true );
        expect( isEmpty( new Float32Array( [] ) ) ).toBe( true );
        expect( isEmpty( Uint8Array.from( '1' as Iterable<number> ) ) ).toBe( false );
        expect( isEmpty( Float32Array.from( '1' as Iterable<number> ) ) ).toBe( false );
        expect( isEmpty( new Float32Array( [ 1 ] ) ) ).toBe( false );
    } );

    test( 'returns true for empty object', function(){
        expect( isEmpty( {} ) ).toBe( true );
        expect( isEmpty( {x: 0} ) ).toBe( false );
    } );

    test( 'returns true for empty arguments object', function(){
        expect( isEmpty( ( function(){ return arguments; } )() ) ).toBe( true );
        // @ts-ignore
        expect( isEmpty( ( function(){ return arguments; } )( 0 ) ) ).toBe( false );
    } );

    test( 'returns false for every other value', function(){
        expect( isEmpty( 0 ) ).toBe( false );
        expect( isEmpty( NaN ) ).toBe( false );
        expect( isEmpty( [ '' ] ) ).toBe( false );
    } );
} );
