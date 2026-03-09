import { RouteSegment, Route } from './route';
import { JSONValue, Serializable, JSONObject, createNull } from '@blue/core';
import { pipe } from '@blue/util/function';
import { filter, join, map, reduce } from '@blue/util/list';
import { both, complement, isNotEmpty } from '@blue/util/logic';
import { keys } from '@blue/util/object';
import { max } from '@blue/util/relation';
import { replace, split, trim } from '@blue/util/string';
import { isNil } from '@blue/util/types';
import { QueryString, MatrixString } from '@blue/http';

const questionMark = '?',
    semicolon = ';',
    slash = '/',
    { defineProperty } = Reflect,
    isNotNil = complement(isNil),
    isNotNilAndNotEmpty = both(isNotNil, isNotEmpty),
    joinOnSlash = join(slash),
    leadingSlash = new RegExp(`^${slash}`),
    removeLeadingSlash = replace(leadingSlash, ''),
    splitOnQuestionMark = split(questionMark),
    splitOnSlash = split(slash),
    startsWithColon = (value: string): boolean => value.startsWith(':'),
    startsWithBrace = (value: string): boolean => value.startsWith('{'),
    endsWithBrace = (value: string): boolean => value.endsWith('}'),
    splitPathIntoSegments = pipe(splitOnSlash, filter(isNotNilAndNotEmpty)) as (value: string) => string[],
    splitRouteIntoParts = pipe(trim, removeLeadingSlash, splitOnQuestionMark);

let routeId = 0;

/**
 * @returns {number} The next route id
 */
function nextRouteId(): number {
    return ++routeId;
}

/**
 */
export class PathRouteSegment implements RouteSegment, Serializable {
    readonly name: string;
    readonly data: JSONObject;
    readonly dataString?: string;
    readonly raw: string;

    constructor(segment: string) {
        const index = segment.indexOf(semicolon);

        defineProperty(this, 'raw', {
            value: segment,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        if (index > -1) {
            defineProperty(this, 'name', {
                value: segment.slice(0, index),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            const dataString = segment.slice(index);
            if (dataString === semicolon) {
                defineProperty(this, 'data', {
                    value: null,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
                defineProperty(this, 'dataString', {
                    value: '',
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            } else {
                defineProperty(this, 'data', {
                    value: MatrixString.parse(dataString),
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
                defineProperty(this, 'dataString', {
                    value: MatrixString.stringify(this.data),
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }
        } else {
            defineProperty(this, 'name', {
                value: segment,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'data', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    }

    toJSON(): JSONValue {
        const json: JSONObject = createNull();

        json.name = this.name;
        json.data = this.data;

        return json;
    }

    toString(): string {
        const { data, dataString, name } = this,
            matrixString = data && !dataString ? MatrixString.stringify(data) : dataString;
        return matrixString ? `${name}${semicolon}${matrixString}` : name;
    }
}

/**
 * @implements module:router.Route
 * @implements module:core.Serializable
 */
export class PathRoute implements Route, Serializable {
    [n: number]: RouteSegment;

    readonly data: JSONObject;
    readonly dataString?: string;
    readonly id: number;
    params: JSONObject;
    readonly path: string;
    readonly raw: string;

    get length(): number {
        const keysArray = keys(this) as readonly string[];
        const indices = map(parseInt)(keysArray);
        const maxIndex = reduce(max, -1)(indices) as number;
        return maxIndex + 1;
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

    constructor(route: string) {
        defineProperty(this, 'raw', {
            value: route,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'id', {
            value: nextRouteId(),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'params', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        const parts = splitRouteIntoParts(route),
            segments = splitPathIntoSegments(parts[0]),
            queryString = parts[1],
            length = segments.length;
        let index = 0,
            path: string[] = new Array<string>(length);

        for (; index < length; index++) {
            defineProperty(this, index, {
                value: new PathRouteSegment(segments[index]),
                configurable: true,
                enumerable: true,
                writable: false,
            });
            path[index] = this[index].name;
        }

        defineProperty(this, 'path', {
            value: joinOnSlash(path),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        if (queryString) {
            defineProperty(this, 'data', {
                value: QueryString.parse(queryString),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'dataString', {
                value: QueryString.stringify(this.data),
                configurable: true,
                enumerable: false,
                writable: false,
            });
        } else {
            defineProperty(this, 'data', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'dataString', {
                value: '',
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    }

    toJSON(): JSONValue {
        const json = createNull(),
            length = this.length;
        let index = 0;

        json.id = this.id;
        json.data = this.data;
        json.params = this.params;
        json.length = length;

        for (; index < length; index++) {
            json[index] = (this[index] as Serializable).toJSON();
        }

        return json;
    }

    toString(): string {
        const { data, dataString, length } = this,
            segments: string[] = [],
            queryString = data && !dataString ? QueryString.stringify(data) : dataString;
        let index = 0,
            output = '';

        for (; index < length; index++) {
            segments[index] = this[index].toString();
        }

        output = `${slash}${segments.join(slash)}`;

        return queryString ? `${output}${questionMark}${queryString}` : output;
    }

    matches(pattern: string): boolean {
        return isNotNil(this.resolveParams(pattern));
    }

    resolveParams(pattern: string): JSONObject | null {
        const patternParts = splitRouteIntoParts(pattern),
            patternSegments = splitPathIntoSegments(patternParts[0]),
            params: JSONObject = createNull(),
            length = this.length;

        if (patternSegments.length !== length) {
            return null;
        }

        for (let index = 0; index < length; index++) {
            const routeSegment = this[index],
                patternSegment = patternSegments[index],
                paramName = this._resolveParamName(patternSegment);

            if (!paramName) {
                if (patternSegment !== routeSegment.name) {
                    return null;
                }

                continue;
            }

            params[paramName] = routeSegment.name;
        }

        this.params = params;

        return params;
    }

    private _resolveParamName(patternSegment: string): string | null {
        if (startsWithColon(patternSegment) && patternSegment.length > 1) {
            return patternSegment.slice(1);
        }

        if (startsWithBrace(patternSegment) && endsWithBrace(patternSegment) && patternSegment.length > 2) {
            return patternSegment.slice(1, -1);
        }

        return null;
    }
}
