import { createNull } from '@blue/core';
import { both, complement, filter, isEmpty, isNil, join, pipe, replace, split, trim, keys, map, max, reduce, } from '@blue/util';
import fromMatrixString from './from-matrix-string';
import toMatrixString from './to-matrix-string';
import toQueryString from './to-query-string';
import fromQueryString from './from-query-string';
const questionMark = '?', semicolon = ';', slash = '/', { defineProperty } = Reflect, isNotEmpty = complement(isEmpty), isNotNil = complement(isNil), isNotNilAndNotEmpty = both(isNotNil, isNotEmpty), joinOnSlash = join(slash), leadingSlash = new RegExp(`^${slash}`), removeLeadingSlash = replace(leadingSlash, ''), splitOnQuestionMark = split(questionMark), splitOnSlash = split(slash), splitPathIntoSegments = pipe(splitOnSlash, filter(isNotNilAndNotEmpty)), splitRouteIntoParts = pipe(trim, removeLeadingSlash, splitOnQuestionMark);
let routeId = 0;
/**
 * @returns {number} The next route id
 */
function nextRouteId() {
    return ++routeId;
}
/**
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