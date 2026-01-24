import { createNull } from '@blue/core';
import { both, complement, filter, isEmpty, isNil, join, pipe, replace, split, trim, keys, map, max, reduce, } from '@blue/util';
import fromMatrixString from './from-matrix-string';
import toMatrixString from './to-matrix-string';
import toQueryString from './to-query-string';
import fromQueryString from './from-query-string';
const questionMark = '?', semicolon = ';', slash = '/', { defineProperty } = Reflect, isNotEmpty = complement(isEmpty), isNotNil = complement(isNil), isNotNilAndNotEmpty = both(isNotNil, isNotEmpty), joinOnSlash = join(slash), leadingSlash = new RegExp(`^${slash}`), removeLeadingSlash = replace(leadingSlash, ''), splitOnQuestionMark = split(questionMark), splitOnSlash = split(slash), splitPathIntoSegments = pipe(splitOnSlash, filter(isNotNilAndNotEmpty)), splitRouteIntoParts = pipe(trim, removeLeadingSlash, splitOnQuestionMark);
let routeId = 0;
/**
 * @function module:router~nextRouteId
 * @returns {external:number} The next route id
 */
function nextRouteId() {
    return ++routeId;
}
/**
 * @class module:router.PathRouteSegment
 */
export class PathRouteSegment {
    name;
    data;
    dataString;
    raw;
    constructor(segment) {
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
            }
            else {
                defineProperty(this, 'data', {
                    value: fromMatrixString(dataString),
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
                defineProperty(this, 'dataString', {
                    value: toMatrixString(this.data),
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }
        }
        else {
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
    toJSON() {
        const json = createNull();
        json.name = this.name;
        json.data = this.data;
        return json;
    }
    toString() {
        const { data, dataString, name } = this, matrixString = data && !dataString ? toMatrixString(data) : dataString;
        return matrixString ? `${name}${semicolon}${matrixString}` : name;
    }
}
/**
 * @class module:router.PathRoute
 * @implements module:router.Route
 * @implements module:core.Serializable
 */
export class PathRoute {
    data;
    dataString;
    id;
    path;
    raw;
    get length() {
        const keysArray = keys(this);
        const indices = map(parseInt)(keysArray);
        const maxIndex = reduce(max, -1)(indices);
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
    constructor(route) {
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
        const parts = splitRouteIntoParts(route), segments = splitPathIntoSegments(parts[0]), queryString = parts[1], length = segments.length;
        let index = 0, path = new Array(length);
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
                value: fromQueryString(queryString),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'dataString', {
                value: toQueryString(this.data),
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        else {
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
    toJSON() {
        const json = createNull(), length = this.length;
        let index = 0;
        json.id = this.id;
        json.data = this.data;
        json.length = length;
        for (; index < length; index++) {
            json[index] = this[index].toJSON();
        }
        return json;
    }
    toString() {
        const { data, dataString, length } = this, segments = [], queryString = data && !dataString ? toQueryString(data) : dataString;
        let index = 0, output = '';
        for (; index < length; index++) {
            segments[index] = this[index].toString();
        }
        output = `${slash}${segments.join(slash)}`;
        return queryString ? `${output}${questionMark}${queryString}` : output;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC1yb3V0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRoLXJvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBdUMsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzdFLE9BQU8sRUFDSCxJQUFJLEVBQ0osVUFBVSxFQUNWLE1BQU0sRUFDTixPQUFPLEVBQ1AsS0FBSyxFQUNMLElBQUksRUFDSixJQUFJLEVBQ0osT0FBTyxFQUNQLEtBQUssRUFDTCxJQUFJLEVBQ0osSUFBSSxFQUNKLEdBQUcsRUFDSCxHQUFHLEVBQ0gsTUFBTSxHQUNULE1BQU0sWUFBWSxDQUFDO0FBQ3BCLE9BQU8sZ0JBQWdCLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxjQUFjLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxhQUFhLE1BQU0sbUJBQW1CLENBQUM7QUFDOUMsT0FBTyxlQUFlLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUNwQixTQUFTLEdBQUcsR0FBRyxFQUNmLEtBQUssR0FBRyxHQUFHLEVBQ1gsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzVCLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQ2hDLFFBQVEsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQzVCLG1CQUFtQixHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQ2hELFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ3pCLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLEVBQ3RDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLEVBQzlDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFDekMsWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFDM0IscUJBQXFCLEdBQUcs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