import fromMatrixString from '../src/from-matrix-string';

describe( 'fromMatrixString', function(){
    test( 'it should parse matrix strings starting with a `;`', function(){
        expect( fromMatrixString( ';foo=bar' ) ).toEqual( { foo: 'bar' } );
    } );

    test( 'it should parse a matrix string', function(){
        expect( fromMatrixString( 'foo=bar' ) ).toEqual( { foo: 'bar' } );
    } );

    test( 'it should parse multiple matrix strings', function(){
        expect( fromMatrixString( 'foo=bar;key=val' ) ).toEqual( {
            foo: 'bar',
            key: 'val'
        } );
    } );

    test( 'it should parse matrix strings without a value', function(){
        expect( fromMatrixString( 'foo' ) ).toEqual( { foo: null } );
        expect( fromMatrixString( 'foo;key' ) ).toEqual( {
            foo: null,
            key: null
        } );
        expect( fromMatrixString( 'foo=bar;key' ) ).toEqual( {
            foo: 'bar',
            key: null
        } );
        expect( fromMatrixString( 'a=,' ) ).toEqual( { a: [ '', '' ] } );
    } );

    test( 'it should return empty object if no matrix string can be found', function(){
        expect( fromMatrixString( ';' ) ).toEqual( {} );
        expect( fromMatrixString( ' ' ) ).toEqual( {} );
    } );

    test( 'it should handle `+` correctly', function(){
        expect( fromMatrixString( 'foo+faz=bar+baz++' ) ).toEqual( { 'foo faz': 'bar baz  ' } );
    } );

    test( 'it should parse matrix strings params including embedded `=`', function(){
        expect( fromMatrixString( ';param=http%3A%2F%2Fsomeurl%3Fid%3D2837' ) ).toEqual( { param: 'http://someurl?id=2837' } );
    } );

    test( 'it should parse matrix strings params including raw `=`', function(){
        expect( fromMatrixString( ';param=http://someurl?id=2837' ) ).toEqual( { param: 'http://someurl?id=2837' } );
    } );

    test( 'it should parse object properties', function(){
        // expect( fromMatrixString().prototype ).toBeUndefined();
        expect( fromMatrixString( 'hasOwnProperty=foo' ) ).toEqual( { hasOwnProperty: 'foo' } );
    } );

    test( 'it should parse matrix strings not having a bracketed value and format option as `bracket`', function(){
        expect( fromMatrixString( 'foo=bar' ) ).toEqual( { foo: 'bar' } );
    } );

    test( 'it should parse decode keys and values', function(){
        expect( fromMatrixString( 'st%C3%A5le=foo' ) ).toEqual( { ståle: 'foo' } );
        expect( fromMatrixString( 'foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%' ) ).toEqual( { foo: '{%ab%|%de%} %{ståle}%' } );
    } );
} );
