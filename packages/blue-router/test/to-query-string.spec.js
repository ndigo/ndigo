import toQueryString from '../src/to-query-string';

describe( 'toQueryString', function(){
    test( 'it should stringify', function(){
        expect( toQueryString( { foo: 'bar' } ) ).toBe( 'foo=bar' );
        expect( toQueryString( { foo: 'bar', bar: 'baz' } ) ).toBe( 'bar=baz&foo=bar' );
    } );

    test( 'it should handle encoding', function(){
        expect( toQueryString( { 'foo bar': 'baz faz' } ) ).toBe( 'foo%20bar=baz%20faz' );
        expect( toQueryString( { 'foo bar': 'baz\'faz' } ) ).toBe( 'foo%20bar=baz%27faz' );
    } );

    test( 'it should handle array values', function(){
        expect( toQueryString( { abc: 'abc', foo: [ 'bar', 'baz' ] } ) ).toBe( 'abc=abc&foo=bar&foo=baz' );
    } );

    test( 'it should maintain array value order', function(){
        expect( toQueryString( { abc: 'abc', foo: [ 'baz', 'bar' ] } ) ).toBe( 'abc=abc&foo=baz&foo=bar' );
    } );

    test( 'it should handle empty array values', function(){
        expect( toQueryString( { abc: 'abc', foo: [] } ) ).toBe( 'abc=abc' );
    } );

    test( 'it should not encode undefined values', function(){
        expect( toQueryString( { abc: undefined, foo: 'baz' } ) ).toBe( 'foo=baz' );
    } );

    test( 'it should encode null values as just a key', function(){
        expect( toQueryString( { 'x y z': null, 'abc': null, 'foo': 'baz' } ) ).toBe( 'abc&foo=baz&x%20y%20z' );
    } );

    test( 'it should handle null values in array', function(){
        expect( toQueryString( { foo: null, bar: [ null, 'baz' ] } ) ).toBe( 'bar&bar=baz&foo' );
    } );

    test( 'it should handle undefined values in array', function(){
        expect( toQueryString( { foo: null, bar: [ undefined, 'baz' ] } ) ).toBe( 'bar=baz&foo' );
    } );

    test( 'it should handle undefined and null values in array', function(){
        expect( toQueryString( { foo: null, bar: [ undefined, null, 'baz' ] } ) ).toBe( 'bar&bar=baz&foo' );
    } );

    test( 'it should handle strict encoding', function(){
        expect( toQueryString( { foo: '\'bar\'' } ) ).toBe( 'foo=%27bar%27' );
        expect( toQueryString( { foo: [ '\'bar\'', '!baz' ] } ) ).toBe( 'foo=%27bar%27&foo=%21baz' );
    } );

    /*
    test( 'it should handle index array formatting', function(){
        expect( toQueryString( { foo: null, bar: [ 'one', 'two' ] }, { arrayFormat: 'index' } ) ).toBe( 'bar[0]=one&bar[1]=two&foo' );
    } );

    test( 'it should handle bracket array formatting', function(){
        expect( toQueryString( { foo: null, bar: [ 'one', 'two' ] }, { arrayFormat: 'bracket' } ) ).toBe( 'bar[]=one&bar[]=two&foo' );
    } );

    test( 'it should handle sparse index array formatting', function(){
        const array: string[] = [ 'one', 'two' ];
        array[ 10 ] = 'three';
        expect( toQueryString( { bar: array }, { arrayFormat: 'index' } ) ).toBe( 'bar[0]=one&bar[1]=two&bar[2]=three' );
    } );
    */
} );
