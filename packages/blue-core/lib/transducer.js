/**
 * @author Jeff Rose
 * @see {@link https://github.com/cognitect-labs/transducers-js/issues/20}
 * @see {@link https://github.com/cognitect-labs/transducers-js#transformer-protocol}
 * @see {@link https://github.com/jlongster/transducers.js#the-transducer-protocol}
 * @see {@link https://github.com/dphilipson/transducist}
 */
import { like } from '@blue/util';
import { MultiValueMap } from './collection';
const defineProperty = Reflect.defineProperty;
export class DelegatingTransformer {
    xf;
    constructor(xf) {
        defineProperty(this, 'xf', {
            value: xf,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    ['@@transducer/init']() {
        return this.xf['@@transducer/init']();
    }
    ['@@transducer/result'](result) {
        return this.xf['@@transducer/result'](result);
    }
    ['@@transducer/step'](result, input) {
        return this.xf['@@transducer/step'](result, input);
    }
}
/**
 * Determines whether an value is reduced. This is done using the transformer protocol; an object with the protocol-
 * specified `reduced` property is assumed to be reduced. If a result of a transformation is reduced, it means that the
 * transformation is complete and the channel should be closed.
 * @function module:core.likeReduced
 * @param {*} value The value being checked for reduction.
 * @return {boolean} Whether ot not the value has been reduced.
 */
export const likeReduced = like({ '@@transducer/reduced': true });
/**
 * Determines whether a value is a transformer.
 * @function module:core.likeTransformer
 * @param {*} value The value being checked.
 * @return {boolean} Whether or not the value is a transformer.
 */
export const likeTransformer = like({ '@@transducer/step': Function });
/**
 * @param {*} value The value being reduced.
 */
export function reduce(value) {
    return likeReduced(value)
        ? value
        : {
            ['@@transducer/reduced']: true,
            ['@@transducer/value']: value,
        };
}
export class XCount {
    ['@@transducer/init']() {
        return 0;
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result) {
        return result + 1;
    }
}
export const xCount = () => new XCount();
export const count = () => xCount;
export class XToArray {
    ['@@transducer/init']() {
        return [];
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.push(input);
        return result;
    }
}
export const xToArray = () => new XToArray();
export const toArray = () => xToArray;
export class XToMap {
    _getKey;
    _getValue;
    constructor(getKey, getValue) {
        defineProperty(this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    ['@@transducer/init']() {
        return new Map();
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.set(this._getKey(input), this._getValue(input));
        return result;
    }
}
export const toMap = (getKey, getValue) => () => new XToMap(getKey, getValue);
export class XToMultiValueMap {
    _getKey;
    _getValue;
    constructor(getKey, getValue) {
        defineProperty(this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    ['@@transducer/init']() {
        return new MultiValueMap();
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.add(this._getKey(input), this._getValue(input));
        return result;
    }
}
export const toMultiValueMap = (getKey, getValue) => () => new XToMultiValueMap(getKey, getValue);
export class XToRecord {
    _getKey;
    _getValue;
    constructor(getKey, getValue) {
        defineProperty(this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    ['@@transducer/init']() {
        return {};
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result[this._getKey(input)] = this._getValue(input);
        return result;
    }
}
export const toRecord = (getKey, getValue) => () => new XToRecord(getKey, getValue);
export class XToSet {
    set;
    constructor(set = new Set()) {
        this.set = set;
    }
    ['@@transducer/init']() {
        return this.set;
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.add(input);
        return result;
    }
}
export const toSet = (set) => () => new XToSet(set);
export const dispatchable = (methodNames, xf, fn) => (target, ...args) => {
    // @ts-ignore: ¯\_(ツ)_/¯
    // eslint-disable-next-line no-undef
    if (arguments.length === 0) {
        return fn();
    }
    if (!Array.isArray(target)) {
        let index = 0;
        const length = methodNames.length;
        while (index < length) {
            const methodName = methodNames[index], method = target[methodName];
            if (typeof method === 'function') {
                return method.apply(target, args);
            }
            index++;
        }
        if (likeTransformer(target)) {
            const transducer = xf.apply(null, args);
            return transducer(target);
        }
        // @ts-ignore: ¯\_(ツ)_/¯
        // eslint-disable-next-line no-undef
        return fn.apply(this, arguments);
    }
};
/**
 * * Developer Notes
 * ? Should this be in blue-util?
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNkdWNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90cmFuc2R1Y2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUU3QyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO0FBd0I5QyxNQUFNLE9BQU8scUJBQXFCO0lBR3JCLEVBQUUsQ0FBb0Q7SUFFL0QsWUFBWSxFQUFxRDtRQUM3RCxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN2QixLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxDQUFDLG1CQUFtQixDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVELENBQUMscUJBQXFCLENBQUMsQ0FBRSxNQUFlO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBZSxFQUFFLEtBQWE7UUFDaEQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSjtBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLENBQXFDLENBQUM7QUFFdEc7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFB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