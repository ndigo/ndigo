import QueryString from '../src/query-string';

describe( 'QueryString', function(){

    context( 'parse', function(){
        xtest( 'it should parse query strings starting with a `?`', function(){
            expect( QueryString.parse( '?foo=bar' ) ).toEqual( { foo: 'bar' } );
        } );

        xtest( 'it should parse query strings starting with a `#`', function(){
            expect( QueryString.parse( '#foo=bar' ) ).toEqual( { foo: 'bar' } );
        } );

        xtest( 'it should parse query strings starting with a `&`', function(){
            expect( QueryString.parse( '&foo=bar&foo=baz&foo=qux' ) ).toEqual( { foo: [ 'bar', 'baz', 'qux' ] } );
        } );

        xtest( 'it should parse a query string', function(){
            expect( QueryString.parse( 'foo=bar' ) ).toEqual( { foo: 'bar' } );
        } );

        xtest( 'it should parse multiple query string', function(){
            expect( QueryString.parse( 'foo=bar&key=val' ) ).toEqual( {
                foo: 'bar',
                key: 'val'
            } );
        } );

        test( 'it should parse query string without a value', function(){
            expect( QueryString.parse( 'foo' ) ).toEqual( { foo: null } );
            expect( QueryString.parse( 'foo&key' ) ).toEqual( {
                foo: null,
                key: null
            } );
            expect( QueryString.parse( 'foo=bar&key' ) ).toEqual( {
                foo: 'bar',
                key: null
            } );
            expect( QueryString.parse( 'a&a' ) ).toEqual( { a: [ null, null ] } );
            expect( QueryString.parse( 'a=&a' ) ).toEqual( { a: [ null, null ] } );
        } );

        test( 'it should return empty object if no query string can be found', function(){
            expect( QueryString.parse( '?' ) ).toEqual( {} );
            expect( QueryString.parse( '&' ) ).toEqual( {} );
            expect( QueryString.parse( '#' ) ).toEqual( {} );
            expect( QueryString.parse( ' ' ) ).toEqual( {} );
        } );

        test( 'it should handle `+` correctly', function(){
            expect( QueryString.parse( 'foo+faz=bar+baz++' ) ).toEqual( { 'foo faz': 'bar baz  ' } );
        } );

        test( 'it should handle multiple of the same key', function(){
            expect( QueryString.parse( 'foo=bar&foo=baz' ) ).toEqual( { foo: [ 'bar', 'baz' ] } );
        } );

        test( 'it should handle multiple values and preserve appearence order', function(){
            expect( QueryString.parse( 'a=value&a=' ) ).toEqual( { a: [ 'value', null ] } );
            expect( QueryString.parse( 'a=&a=value' ) ).toEqual( { a: [ null, 'value' ] } );
        } );

        xtest( 'it should handle multiple values and preserve appearance order with brackets', function(){
            expect( QueryString.parse( 'a[]=value&a[]=' ) ).toEqual( { a: [ 'value', null ] } );
            expect( QueryString.parse( 'a[]=&a[]=value' ) ).toEqual( { a: [ null, 'value' ] } );
        } );

        xtest( 'it should handle multiple values and preserve appearance order with indexes', function(){
            expect( QueryString.parse( 'a[0]=value&a[1]=' ) ).toEqual( { a: [ 'value', null ] } );
            expect( QueryString.parse( 'a[1]=&a[0]=value' ) ).toEqual( { a: [ 'value', null ] } );
        } );

        test( 'it should parse query strings params including embedded `=`', function(){
            expect( QueryString.parse( '?param=http%3A%2F%2Fsomeurl%3Fid%3D2837' ) ).toEqual( { param: 'http://someurl?id=2837' } );
        } );

        test( 'it should parse query strings params including raw `=`', function(){
            expect( QueryString.parse( '?param=http://someurl?id=2837' ) ).toEqual( { param: 'http://someurl?id=2837' } );
        } );

        test( 'it should parse object properties', function(){
            // expect( QueryString.parse().prototype ).toBeUndefined();
            expect( QueryString.parse( 'hasOwnProperty=foo' ) ).toEqual( { hasOwnProperty: 'foo' } );
        } );

        test( 'it should parse query strings having indexed arrays', function(){
            expect( QueryString.parse( 'foo[0]=bar&foo[1]=baz' ) ).toEqual( { 'foo[0]': 'bar', 'foo[1]': 'baz' } );
        } );

        xtest( 'it should parse query strings having brackets arrays', function(){
            expect( QueryString.parse( 'foo[]=bar&foo[]=baz' ) ).toEqual( { 'foo[]': [ 'bar', 'baz' ] } );
        } );

        xtest( 'it should parse query strings having indexed arrays keeping index order', function(){
            expect( QueryString.parse( 'foo[1]=bar&foo[0]=baz' ) ).toEqual( { 'foo[1]': 'bar', 'foo[0]': 'baz' } );
        } );

        xtest( 'it should parse query string having a single bracketed value and format option as `bracket`', function(){
            expect( QueryString.parse( 'foo[]=bar' ) ).toEqual( { foo: [ 'bar' ] } );
        } );

        xtest( 'it should parse query string not having a bracketed value and format option as `bracket`', function(){
            expect( QueryString.parse( 'foo=bar' ) ).toEqual( { foo: 'bar' } );
        } );

        xtest( 'it should parse query string having a bracketed value and a single value and format option as `bracket`', function(){
            expect( QueryString.parse( 'foo=bar&baz[]=bar' ) ).toEqual( { foo: 'bar', baz: [ 'bar' ] } );
        } );

        xtest( 'it should parse query strings having brackets arrays and format option as `bracket`', function(){
            expect( QueryString.parse( 'foo[]=bar&foo[]=baz' ) ).toEqual( { foo: [ 'bar', 'baz' ] } );
        } );

        xtest( 'it should parse query strings having indexed arrays and format option as `index`', function(){
            expect( QueryString.parse( 'foo[0]=bar&foo[1]=baz' ) ).toEqual( { foo: [ 'bar', 'baz' ] } );
        } );

        xtest( 'it should parse query strings having ordered index arrays and format option as `index`', function(){
            expect( QueryString.parse( 'foo[1]=bar&foo[0]=baz&foo[3]=one&foo[2]=two' ) ).toEqual( { foo: [ 'baz', 'bar', 'two', 'one' ] } );
            expect( QueryString.parse( 'foo[0]=bar&foo[1]=baz&foo[2]=one&foo[3]=two' ) ).toEqual( { foo: [ 'bar', 'baz', 'one', 'two' ] } );
            expect( QueryString.parse( 'foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero' ) ).toEqual( { foo: [ 'zero', 'one', 'two', 'three' ] } );
            expect( QueryString.parse( 'foo[3]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz' ) ).toEqual( { foo: [ 'zero', 'one', 'two', 'three' ], bat: 'buz'} );
            expect( QueryString.parse( 'foo[1]=bar&foo[0]=baz' ) ).toEqual( { foo: [ 'baz', 'bar' ] } );
            expect( QueryString.parse( 'foo[102]=three&foo[2]=two&foo[1]=one&foo[0]=zero&bat=buz' ) ).toEqual( { bat: 'buz', foo: [ 'zero', 'one', 'two', 'three' ] } );
            expect( QueryString.parse( 'foo[102]=three&foo[2]=two&foo[100]=one&foo[0]=zero&bat=buz' ) ).toEqual( { bat: 'buz', foo: [ 'zero', 'two', 'one', 'three' ] } );
        } );

        xtest( 'it should parse circuit QueryString.parse -> stringify', function(){
            const
                original = 'foo[3]=foo&foo[2]&foo[1]=one&foo[0]=&bat=buz',
                sortedOriginal = 'bat=buz&foo[0]=&foo[1]=one&foo[2]&foo[3]=foo',
                expected = { bat: 'buz', foo: [ '', 'one', null, 'foo' ] };

            expect( QueryString.parse( original ) ).toEqual( expected );
            expect( QueryString.stringify( expected ) ).toBe( sortedOriginal );
        } );

        xtest( 'it should parse circuit original -> QueryString.parse - > stringify -> sorted original', function(){
            const
                original = 'foo[21474836471]=foo&foo[21474836470]&foo[1]=one&foo[0]=&bat=buz',
                sortedOriginal = 'bat=buz&foo[0]=&foo[1]=one&foo[2]&foo[3]=foo',
                options = {};

            expect( QueryString.stringify( QueryString.parse( original, options ), options ), sortedOriginal );
        } );

        test( 'it should parse decode keys and values', function(){
            expect( QueryString.parse( 'st%C3%A5le=foo' ) ).toEqual( { ståle: 'foo' } );
            expect( QueryString.parse( 'foo=%7B%ab%%7C%de%%7D+%%7Bst%C3%A5le%7D%' ) ).toEqual( { foo: '{%ab%|%de%} %{ståle}%' } );
        } );

    } );

    context( 'stringify', function(){
        test( 'it should stringify', function(){
            expect( QueryString.stringify( { foo: 'bar' } ) ).toBe( 'foo=bar' );
            expect( QueryString.stringify( { foo: 'bar', bar: 'baz' } ) ).toBe( 'bar=baz&foo=bar' );
        } );

        test( 'it should handle encoding', function(){
            expect( QueryString.stringify( { 'foo bar': 'baz faz' } ) ).toBe( 'foo%20bar=baz%20faz' );
            expect( QueryString.stringify( { 'foo bar': 'baz\'faz' } ) ).toBe( 'foo%20bar=baz%27faz' );
        } );

        test( 'it should handle array values', function(){
            expect( QueryString.stringify( { abc: 'abc', foo: [ 'bar', 'baz' ] } ) ).toBe( 'abc=abc&foo=bar&foo=baz' );
        } );

        test( 'it should maintain array value order', function(){
            expect( QueryString.stringify( { abc: 'abc', foo: [ 'baz', 'bar' ] } ) ).toBe( 'abc=abc&foo=baz&foo=bar' );
        } );

        test( 'it should handle empty array values', function(){
            expect( QueryString.stringify( { abc: 'abc', foo: [] } ) ).toBe( 'abc=abc' );
        } );

        test( 'it should not encode undefined values', function(){
            expect( QueryString.stringify( { abc: undefined, foo: 'baz' } ) ).toBe( 'foo=baz' );
        } );

        test( 'it should encode null values as just a key', function(){
            expect( QueryString.stringify( { 'x y z': null, 'abc': null, 'foo': 'baz' } ) ).toBe( 'abc&foo=baz&x%20y%20z' );
        } );

        test( 'it should handle null values in array', function(){
            expect( QueryString.stringify( { foo: null, bar: [ null, 'baz' ] } ) ).toBe( 'bar&bar=baz&foo' );
        } );

        test( 'it should handle undefined values in array', function(){
            expect( QueryString.stringify( { foo: null, bar: [ undefined, 'baz' ] } ) ).toBe( 'bar=baz&foo' );
        } );

        test( 'it should handle undefined and null values in array', function(){
            expect( QueryString.stringify( { foo: null, bar: [ undefined, null, 'baz' ] } ) ).toBe( 'bar&bar=baz&foo' );
        } );

        test( 'it should handle strict encoding', function(){
            expect( QueryString.stringify( { foo: '\'bar\'' } ) ).toBe( 'foo=%27bar%27' );
            expect( QueryString.stringify( { foo: [ '\'bar\'', '!baz' ] } ) ).toBe( 'foo=%27bar%27&foo=%21baz' );
        } );

        /*
        test( 'it should handle index array formatting', function(){
            expect( QueryString.stringify( { foo: null, bar: [ 'one', 'two' ] }, { arrayFormat: 'index' } ) ).toBe( 'bar[0]=one&bar[1]=two&foo' );
        } );

        test( 'it should handle bracket array formatting', function(){
            expect( QueryString.stringify( { foo: null, bar: [ 'one', 'two' ] }, { arrayFormat: 'bracket' } ) ).toBe( 'bar[]=one&bar[]=two&foo' );
        } );

        test( 'it should handle sQueryString.parse index array formatting', function(){
            const array: string[] = [ 'one', 'two' ];
            array[ 10 ] = 'three';
            expect( QueryString.stringify( { bar: array }, { arrayFormat: 'index' } ) ).toBe( 'bar[0]=one&bar[1]=two&bar[2]=three' );
        } );
        */
    } );
} );
