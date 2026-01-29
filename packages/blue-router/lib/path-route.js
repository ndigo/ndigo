import { createNull } from '@blue/core';
import { pipe } from '@blue/util/function';
import { filter, join, map, reduce } from '@blue/util/list';
import { both, complement, isEmpty } from '@blue/util/logic';
import { keys } from '@blue/util/object';
import { max } from '@blue/util/relation';
import { replace, split, trim } from '@blue/util/string';
import { isNil } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC1yb3V0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXRoLXJvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBdUMsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzdFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDNUQsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDN0QsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxnQkFBZ0IsTUFBTSxzQkFBc0IsQ0FBQztBQUNwRCxPQUFPLGNBQWMsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLGVBQWUsTUFBTSxxQkFBcUIsQ0FBQztBQUVsRCxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQ3BCLFNBQVMsR0FBRyxHQUFHLEVBQ2YsS0FBSyxHQUFHLEdBQUcsRUFDWCxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUIsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFDaEMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFDNUIsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFDaEQsV0FBVyxHQUFHLElBQUksQ0FBQyxL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