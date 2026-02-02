/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { isEmpty, isNotEmpty } from '@blue/util/logic';
import { encodeURIComponent as encode } from '@blue/util/string';

//import { JSONValue, DelegatingTransformer, Reduced, Transformer } from '@blue/core';

/*
import { addIndex, complement, cond, equals, ifElse, isEmpty, filter, pipe, join, keys, map, sort, T } from 'ramda';

const
    //bracketMatcher: RegExp = /(\[\])$/,
    //indexMatcher: RegExp = /\[(\d*)\]$/,

    alphabeticalAscending = ( a, b ) => a.codePointAt( 0 ) - b.codePointAt( 0 ),
    indexedMap = addIndex( map ),
    isNotEmpty = complement( isEmpty ),
    isNull = equals( null ),
    isUndefined = equals( undefined ),
    joinOnAmpersand = join( '&' ),
    removeEmpty = filter( isNotEmpty ),

    // ?foo[]=bar&foo[]=baz
    createBracketParameter = ( key, value, index? ) => ifElse(
        isNull,
        () => encode( key ),
        () => `${ encode( key ) }[]=${ encode( value ) }`
    )( value ),

    // ?foo=bar&foo=baz
    createParameter = ( key, value, index? ) => ifElse(
        isNull,
        () => encode( key ),
        () => `${ encode( key ) }=${ encode( value ) }`
    )( value ),

    // ?foo[0]=bar&foo[1]=baz
    createIndexParameter = ( key, value, index ) => ifElse(
        isNull,
        () => `${ encode( key ) }[${ index }]`,
        () => `${ encode( key ) }[${ encode( String( index ) ) }]=${ encode( value ) }`
    )( value ),

    getListParameterStringifier = ( format ) => cond( [
        [ equals( 'bracket' ) , () => createBracketParameter ],
        [ equals( 'index' )   , () => createIndexParameter ],
        [ T                   , () => createParameter ]
    ] )( format ),

    encodeValueList = ( key, list ) => pipe(
        indexedMap( ( value, index ) => createParameter( key, value, index ) ),
        removeEmpty,
        joinOnAmpersand
    )( list ),

    toQueryString = ( object ) => pipe(
        keys,
        sort( alphabeticalAscending ),
        map( ( key ) => cond( [
            [ isUndefined   , () => '' ],
            [ Array.isArray , () => encodeValueList( key, object[ key ] ) ],
            [ T             , () => createParameter( key, object[ key ] ) ]
        ] ) ),
        removeEmpty,
        joinOnAmpersand
    )( object );

//toQueryString( { e:6, a:1, b:2, c:[3,4], d: 5} ); // a=1&b=2&c=3&c=4&d=5&e=6

export default toQueryString;
*/

const arrayStringifier = (key: string, value: string, index?: number): string =>
        value === null ? encode(key) : `${encode(key)}=${encode(value)}`,
    toQueryString = (object): string =>
        object
            ? Object.keys(object)
                  .sort()
                  .map(function (key: string): string {
                      const value = object[key];

                      if (value === undefined) {
                          return '';
                      }

                      if (value === null) {
                          return encode(key);
                      }

                      if (Array.isArray(value)) {
                          const result: string[] = [];

                          value.slice().forEach(function (val: string): void {
                              if (val === undefined) {
                                  return;
                              }
                              result.push(arrayStringifier(key, val, result.length));
                          });

                          return result.join('&');
                      }

                      return `${encode(key)}=${encode(value)}`;
                  })
                  .filter(isNotEmpty)
                  .join('&')
            : '';

/**
 * Parses an object to query string.
 * @category Object
 * @param {Object} object
 * @returns {string}
 * @example
 * toQueryString( { e:6, a:1, b:2, c:[3,4], d:5 } );
 * //=> "a=1&b=2&c=3&c=4&d=5&e=6"
 */
export default toQueryString;

/*
export class XToQueryString extends DelegatingTransformer<JSONValue,string> {
    constructor( readonly f: Function, xf: Transformer<JSONValue, string> ){
        super( xf );
    }

    [ '@@transducer/step' ]( result: JSONValue, input: string ): JSONValue | Reduced<JSONValue> {
        if( typeof this.f === 'function' ){
            return toQueryString( input );
        }
        return super[ '@@transducer/step' ]( result, input );
    }
}

export const xToQueryString: CurriedFunction2<Function, Transformer<JSONValue, string>, XToQueryString> = curry( ( f, xf ) => new XToQueryString( f, xf ) );

export const qs = curry( ( f: Function, xf: Transformer<JSONValue, string> ) => xToQueryString( f, xf ) );

//export default curry( toQueryString ) as CurriedFunction2<( key: string, value: string, index?: number ) => string, JSONValue, string>;
*/
