/**
 * @author Jeff Rose
 */
/** JSON-compatible value used by matrix-string parsing helpers. */
export type JSONValue = boolean | null | number | string | JSONObject | JSONArray;

/** JSON object value used by matrix-string parsing helpers. */
export interface JSONObject extends Record<string, JSONValue> {}

/** JSON array value used by matrix-string parsing helpers. */
export interface JSONArray extends Array<JSONValue> {}

/** Minimal parser interface used by the matrix-string parser object. */
export interface Parser<T = any> {
    parse(value: string): T;
}

// type ListParser = ( key: string, value: string, accumulator: any ) => void;

// const
//     plus = /\+/g,
//     validParamKey = /^[A-Za-z][A-Za-z0-9%+]*/,
//     validParamValue = /^[A-Za-z0-9%:/?&+=]*/,
//     percentEncoded = /(%[0-9A-Za-z]{2})+/g,
//     percentDecode = ( value: string ): string => value.replace( percentEncoded, decodeURIComponent ),
//     replacePlusWithSpace = replace( plus, ' ' ),
//     decodeParam = pipe( replacePlusWithSpace, percentDecode ),

//     semicolon = char( ';' ),
//     paramValue = sepBy( char( ',' ) )( regex( validParamValue ).map( ( x ) => { console.log( 'X', x ); return x || ''; } ) ),
//     paramKey = regex( validParamKey ).map( function( value ){
//         console.log( 'KEY', value );
//         return value;
//     } ),
//     param = sequenceOf( [ paramKey.map( decodeParam ), possibly( char( '=' ) ), paramValue.map( function( value ){
//         console.log( 'VALUE', value );
//         if( value.length === 1 ){
//             value = value[ 0 ];
//             return value ? decodeParam( value ) : null;
//         } else {

//         }
//     } ) ] ).map( function( [ key, eq, value ] ){
//         console.log( 'PARAM', key, eq, value );
//         return [ key, value ];
//     } ),

//     paramList = sepBy( semicolon )( param ).map( fromRepeatedPairs );

// export const matrixString = sequenceOf( [ possibly( semicolon ), paramList ] ).map( last );

type ListParser = (key: string, value: string, accumulator: any) => void;

const commaMatcher = /,/,
    percentEncoded = /(%[0-9A-Za-z]{2})+/g,
    plus = /\+/g,
    prefixMatcher = /^[;]/,
    createNull = Object.create.bind(Object, null),
    percentDecode = (value: string): string => value.replace(percentEncoded, decodeURIComponent),
    formatter = (key: string, value: string, accumulator: any): void => {
        if (commaMatcher.exec(value)) {
            accumulator[key] = value.split(',');
        } else {
            accumulator[key] = value;
        }
    },
    parseParameterList = (parse: ListParser, delimiter: string, text: string): any =>
        text.split(delimiter).reduce(function (accumulator: any, parameter: string): any {
            const parts: string[] = parameter.replace(plus, ' ').split('='),
                key: string = percentDecode(parts.shift());
            let value: string = parts.length > 0 ? parts.join('=') : undefined;

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            value = value === undefined ? null : percentDecode(value);

            parse(key, value, accumulator);

            return accumulator;
        }, createNull()),
    /**
     * Parses a matrix string into an object.
     * @param {string} text The matrix string
     * @returns {Object} The parsed matrix string.
     * @category String
     */
    fromMatrixString = (text: string): { [key: string]: string } => {
        let parsed: any = createNull();

        text = text.trim().replace(prefixMatcher, '');

        if (!text) {
            return parsed;
        }

        parsed = parseParameterList(formatter, ';', text);

        return Object.keys(parsed).reduce(function (result: any, key: string): any {
            result[key] = parsed[key];
            return result;
        }, createNull());
    };

class MatrixString implements Parser<JSONObject> {
    parse(value: string): JSONObject {
        return fromMatrixString(value);
    }
    run(value: string): any {
        try {
            return {
                isError: false,
                result: this.parse(value),
            };
        } catch (e: any) {
            return {
                isError: true,
                error: e.message,
            };
        }
    }
}

/** Parser object that converts matrix strings into plain objects. */
export default new MatrixString();
