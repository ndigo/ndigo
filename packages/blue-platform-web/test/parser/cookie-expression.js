import cookies from '../src/parser/cookies';

describe( 'cookies', function(){
    test( 'it should parse', function(){
        expect( cookies.run( 'c="' ).result ).toEqual( { "c": "\"" } );
        expect( cookies.run( 'c="content' ).result ).toEqual( { "c": "\"content" } );
        expect( cookies.run( 'c=content"' ).result ).toEqual( { "c": "content\"" } );
        expect( cookies.run( 'c=#' ).result ).toEqual( { "c": "#" } );
        expect( cookies.run( 'c==' ).result ).toEqual( { "c": "=" } );
        expect( cookies.run( 'c=123; d=456' ).result ).toEqual( { "c": "123", "d": "456" } );
    } );

    test( 'it should parse percent encoded characters', function(){
        expect( cookies.run( 'c=%20' ).result ).toEqual( { "c": " " } );
        expect( cookies.run( 'c=%3B%3B' ).result ).toEqual( { "c": ";;" } );
        expect( cookies.run( 'c=%25' ).result ).toEqual( { "c": "%" } );
    } );

    test( 'it should parse multi-byte characters', function(){
        expect( cookies.run( 'c=%C3%A3' ).result ).toEqual( { "c": "ã" } );
        expect( cookies.run( 'c=%E2%82%AF' ).result ).toEqual( { "c": "₯" } );
        expect( cookies.run( 'c=%F0%A9%B8%BD' ).result ).toEqual( { "c": "𩸽" } );
    } );
} );
