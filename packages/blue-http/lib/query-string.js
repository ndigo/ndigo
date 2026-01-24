import queryExpression from './parsers/query-expression';
import { complement, isEmpty, encodeURIComponent as encode } from '@blue/util';
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
const isNotEmpty = complement(isEmpty), arrayStringifier = (key, value, index) => value === null ? encode(key) : `${encode(key)}=${encode(value)}`, toQueryString = (object) => object
    ? Object.keys(object)
        .sort()
        .map(function (key) {
        const value = object[key];
        if (value === undefined) {
            return '';
        }
        if (value === null) {
            return encode(key);
        }
        if (Array.isArray(value)) {
            const result = [];
            value.slice().forEach(function (val) {
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
class QueryString {
    parse(value) {
        const parseResult = queryExpression.run(value);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<JSONObject, string> here
            return parseResult.result;
        }
        return {};
    }
    stringify(value) {
        return toQueryString(value);
    }
}
export default new QueryString();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktc3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3F1ZXJ5LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLGVBQWUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFL0Usc0ZBQXNGO0FBRXRGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUErREU7QUFFRixNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQ2xDLGdCQUFnQixHQUFHLENBQUMsR0FBVyxFQUFFLEtBQWEsRUFBRSxLQUFjLEVBQVUsRUFBRSxDQUN0RSxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUNwRSxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQVUsRUFBRSxDQUMvQixNQUFNO0lBQ0YsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ2QsSUFBSSxFQUFFO1NBQ04sR0FBRyxDQUFDLFVBQVUsR0FBVztRQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUIsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdEIsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDakIsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztZQUU1QixLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBVztnQkFDdkMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7b0JBQ3BCLE9BQU87Z0JBQ1gsQ0FBQztnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7SUFDN0MsQ0FBQyxDQUFDO1NBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQztTQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFtQkU7QUFFRixNQUFNLFdBQVc7SUFDYixLQUFLLENBQUMsS0FBYTtRQUNmLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN2Qiw2REFBNkQ7WUFDN0QsT0FBUSxXQUFtRixDQUFDLE1BQU0sQ0FBQztRQUN2RyxDQUFDO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBQ0QsU0FBUyxDQUFDLEtBQVU7UUFDaEIsT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNKO0FBRUQsZUFBZSxJQUFJLFdBQVcsRUFBRSxDQUFDIn0=