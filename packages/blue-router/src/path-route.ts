import { RouteSegment, Route } from './route';
import { JSONValue, Serializable, JSONObject, createNull } from '@blue/core';
import { both, complement, filter, isEmpty, isNil, join, pipe, replace, split, trim, keys, map, max, reduce } from '@blue/util';
import fromMatrixString from './from-matrix-string';
import toMatrixString from './to-matrix-string';
import toQueryString from './to-query-string';
import fromQueryString from './from-query-string';

const
    questionMark = '?',
    semicolon = ';',
    slash = '/',

    { defineProperty } = Reflect,

    isNotEmpty = complement( isEmpty ),
    isNotNil = complement( isNil ),
    isNotNilAndNotEmpty = both( isNotNil, isNotEmpty ),
    joinOnSlash = join( slash ),
    leadingSlash = new RegExp( `^${ slash }` ),
    removeLeadingSlash = replace( leadingSlash, '' ),
    splitOnQuestionMark = split( questionMark ),
    splitOnSlash = split( slash ),
    splitPathIntoSegments = pipe( splitOnSlash, filter( isNotNilAndNotEmpty ) ) as ( value: string ) => string[],
    splitRouteIntoParts = pipe( trim, removeLeadingSlash, splitOnQuestionMark );

let routeId = 0;

/**
 * @function module:router~nextRouteId
 * @returns {external:number} The next route id
 */
function nextRouteId(): number {
    return ++routeId;
}

/**
 * @class module:router.PathRouteSegment
 */
export class PathRouteSegment implements RouteSegment, Serializable {
    readonly name: string;
    readonly data: JSONObject;
    readonly dataString?: string;
    readonly raw: string;

    constructor( segment: string ){
        const index = segment.indexOf( semicolon );

        defineProperty( this, 'raw', {
            value: segment,
            configurable: true,
            enumerable: false,
            writable: false
        } );

        if( index > -1 ){
            defineProperty( this, 'name', {
                value: segment.slice( 0, index ),
                configurable: true,
                enumerable: false,
                writable: false
            } );
            const dataString = segment.slice( index );
            if( dataString === semicolon ){
                defineProperty( this, 'data', {
                    value: null,
                    configurable: true,
                    enumerable: false,
                    writable: false
                } );
                defineProperty( this, 'dataString', {
                    value: '',
                    configurable: true,
                    enumerable: false,
                    writable: false
                } );
            } else {
                defineProperty( this, 'data', {
                    value: fromMatrixString( dataString ),
                    configurable: true,
                    enumerable: false,
                    writable: false
                } );
                defineProperty( this, 'dataString', {
                    value: toMatrixString( this.data ),
                    configurable: true,
                    enumerable: false,
                    writable: false
                } );
            }
        } else {
            defineProperty( this, 'name', {
                value: segment,
                configurable: true,
                enumerable: false,
                writable: false
            } );
            defineProperty( this, 'data', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false
            } );
        }
    }

    toJSON(): JSONValue {
        const json: JSONObject = createNull();

        json.name = this.name;
        json.data = this.data;

        return json;
    }

    toString(): string {
        const
            { data, dataString, name } = this,
            matrixString = data && !dataString ?
                toMatrixString( data ) :
                dataString;
        return matrixString ? `${ name }${ semicolon }${ matrixString }` : name;
    }
}

/**
 * @class module:router.PathRoute
 * @implements module:router.Route
 * @implements module:core.Serializable
 */
export class PathRoute implements Route, Serializable {
    [ n: number ]: RouteSegment;

    readonly data: JSONObject;
    readonly dataString?: string;
    readonly id: number;
    readonly path: string;
    readonly raw: string;

    get length(): number {
        return pipe( keys, map( parseInt ), reduce<number, number>( max, -1 ) )( this ) + 1;
        /*
        return Object.keys( this ).reduce( function( maxIndex: number, key: string ){
            index = key === '' ? NaN : Number( key );
            if( !Number.isNaN( index ) && index > maxIndex ){
                return index;
            }
            return maxIndex;
        }, -1 ) + 1;
        */
    }

    constructor( route: string ){
        defineProperty( this, 'raw', {
            value: route,
            configurable: true,
            enumerable: false,
            writable: false
        } );

        defineProperty( this, 'id', {
            value: nextRouteId(),
            configurable: true,
            enumerable: false,
            writable: false
        } );

        const
            parts = splitRouteIntoParts( route ),
            segments = splitPathIntoSegments( parts[ 0 ] ),
            queryString = parts[ 1 ],
            length = segments.length;
        let index = 0,
            path: string[] = new Array<string>( length );

        for( ; index < length; index++ ){
            defineProperty( this, index, {
                value: new PathRouteSegment( segments[ index ] ),
                configurable: true,
                enumerable: true,
                writable: false
            } );
            path[ index ] = this[ index ].name;
        }

        defineProperty( this, 'path', {
            value: joinOnSlash( path ),
            configurable: true,
            enumerable: false,
            writable: false
        } );

        if( queryString ){
            defineProperty( this, 'data', {
                value: fromQueryString( queryString ),
                configurable: true,
                enumerable: false,
                writable: false
            } );
            defineProperty( this, 'dataString', {
                value: toQueryString( this.data ),
                configurable: true,
                enumerable: false,
                writable: false
            } );
        } else {
            defineProperty( this, 'data', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false
            } );
            defineProperty( this, 'dataString', {
                value: '',
                configurable: true,
                enumerable: false,
                writable: false
            } );
        }
    }

    toJSON(): JSONValue {
        const
            json = createNull(),
            length = this.length;
        let index = 0;

        json.id = this.id;
        json.data = this.data;
        json.length = length;

        for( ; index < length; index++ ){
            json[ index ] = ( this[ index ] as Serializable ).toJSON();
        }

        return json;
    }

    toString(): string {
        const
            { data, dataString, length } = this,
            segments: string[] = [],
            queryString = data && !dataString ?
                toQueryString( data ) :
                dataString;
        let index = 0,
            output = '';

        for( ; index < length; index++ ){
            segments[ index ] = this[ index ].toString();
        }

        output = `${ slash }${ segments.join( slash ) }`;

        return queryString ? `${ output }${ questionMark }${ queryString }` : output;
    }
}
