import { RouteSegment, Route } from './route';
import { JSONValue, Serializable, JSONObject, createNull } from '@blue/core';
import { isNil } from '@blue/util/types';
import type { HTTPMethod } from '@blue/http';
import { QueryString, MatrixString } from '@blue/http';

const questionMark = '?',
    semicolon = ';',
    slash = '/',
    { defineProperty } = Reflect,
    isNotNil = (value: unknown) => !isNil(value),
    isNotNilAndNotEmpty = (value: unknown) => isNotNil(value) && value !== '',
    joinOnSlash = (arr: string[]): string => arr.join(slash),
    leadingSlash = new RegExp(`^${slash}`),
    removeLeadingSlash = (s: string) => s.replace(leadingSlash, ''),
    splitOnQuestionMark = (s: string) => s.split(questionMark),
    splitOnSlash = (s: string) => s.split(slash),
    startsWithColon = (value: string): boolean => value.startsWith(':'),
    startsWithBrace = (value: string): boolean => value.startsWith('{'),
    endsWithBrace = (value: string): boolean => value.endsWith('}'),
    splitPathIntoSegments = (value: string): string[] => splitOnSlash(value).filter(isNotNilAndNotEmpty),
    splitRouteIntoParts = (value: string): string[] => splitOnQuestionMark(removeLeadingSlash(value.trim()));

let routeId = 0;

/**
 * @returns {number} The next route id
 */
function nextRouteId(): number {
    return ++routeId;
}

/**
 */
/**
 * Represents a single segment of a `PathRoute`, including its name, matrix parameters, and raw string value.
 * It implements `RouteSegment` and `Serializable`.
 * @since 1.0.0
 */
export class PathRouteSegment implements RouteSegment, Serializable {
    readonly name!: string;
    readonly data!: JSONObject;
    readonly dataString?: string;
    readonly raw!: string;

    /**
     * Creates an instance of `PathRouteSegment` from a raw segment string.
     * The segment string can include matrix parameters (e.g., `segment;key=value`).
     * @param segment - The raw string representation of the route segment.
     * @since 1.0.0
     */
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

    /**
     * Serializes the `PathRouteSegment` instance to a JSON object.
     * @returns A `JSONValue` representation of the segment.
     * @since 1.0.0
     */
    toJSON(): JSONValue {
        const json: JSONObject = createNull();

        json.name = this.name;
        json.data = this.data;

        return json;
    }

    /**
     * Returns the string representation of the `PathRouteSegment`, including its name and matrix parameters.
     * @returns The string representation of the segment.
     * @since 1.0.0
     */
    toString(): string {
        const { data, dataString, name } = this,
            matrixString = data && !dataString ? MatrixString.stringify(data) : dataString;
        return matrixString ? `${name}${semicolon}${matrixString}` : name;
    }
}

/**
 * Represents a concrete route based on a URL path, parsing segments, matrix parameters, and query strings.
 * It implements `Route` and `Serializable`.
 * @template TParams - A type representing the route parameters, defaulting to `Record<string, string>`.
 * @since 1.0.0
 */
export class PathRoute implements Route<Record<string, string>>, Serializable {
    [n: number]: RouteSegment;

    readonly data!: JSONObject;
    readonly dataString?: string;
    readonly id!: string;
    method?: HTTPMethod;
    params!: Record<string, string> | null;
    readonly path!: string;
    readonly raw!: string;
    readonly attributes!: Record<string, any>;

    /**
     * Gets the number of segments in the route.
     * @returns The number of route segments.
     * @since 1.0.0
     */
    get length(): number {
        return (
            Object.keys(this).reduce((maxIndex: number, key: string) => {
                const index = key === '' ? NaN : Number(key);
                return !Number.isNaN(index) && index > maxIndex ? index : maxIndex;
            }, -1) + 1
        );
    }

    /**
     * Creates an instance of `PathRoute` from a raw route string.
     * The route string can include path segments, matrix parameters, and a query string.
     * @param route - The raw string representation of the route (e.g., `/foo;a=b/bar?c=d`).
     * @since 1.0.0
     */
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

        defineProperty(this, 'attributes', {
            value: {},
            configurable: true,
            enumerable: false,
            writable: false,
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

    /**
     * Serializes the `PathRoute` instance to a JSON object.
     * @returns A `JSONValue` representation of the route.
     * @since 1.0.0
     */
    toJSON(): JSONValue {
        const json = createNull(),
            length = this.length;
        let index = 0;

        json.id = this.id;
        json.data = this.data;
        json.params = this.params;
        json.length = length;

        for (; index < length; index++) {
            const segment = this[index] as Serializable | undefined;
            if (segment) {
                json[index] = segment.toJSON?.() ?? segment.toString();
            }
        }

        return json;
    }

    /**
     * Returns the string representation of the `PathRoute`, including its segments and query string.
     * @returns The string representation of the route.
     * @since 1.0.0
     */
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

    /**
     * Checks if the current route matches a given pattern.
     * A pattern can include named parameters (e.g., `/users/:id` or `/products/{productId}`).
     * @param pattern - The route pattern to match against.
     * @returns `true` if the route matches the pattern, `false` otherwise.
     * @since 1.0.0
     */
    matches(pattern: string): boolean {
        return isNotNil(this.resolveParams(pattern));
    }

    /**
     * Resolves and extracts parameters from the route based on a given pattern.
     * If the route matches the pattern, an object containing the resolved parameters is returned.
     * @param pattern - The route pattern (e.g., `/users/:id` or `/products/{productId}`).
     * @returns An object of resolved parameters if the route matches, or `null` if there is no match.
     * @since 1.0.0
     */
    resolveParams(pattern: string): Record<string, string> | null {
        const patternParts = splitRouteIntoParts(pattern),
            patternSegments = splitPathIntoSegments(patternParts[0]),
            params: Record<string, string> = createNull(),
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

    /**
     * Resolves the parameter name from a given pattern segment.
     * Supports `:paramName` and `{paramName}` syntaxes.
     * @param patternSegment - The segment from the route pattern.
     * @returns The extracted parameter name, or `null` if the segment is not a parameter.
     * @private
     * @since 1.0.0
     */
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
