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
 * @param {*} value The value being checked for reduction.
 * @returns {boolean} Whether ot not the value has been reduced.
 */
export const likeReduced = like({ '@@transducer/reduced': true });
/**
 * Determines whether a value is a transformer.
 * @param {*} value The value being checked.
 * @returns {boolean} Whether or not the value is a transformer.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNkdWNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90cmFuc2R1Y2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUU3QyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO0FBd0I5QyxNQUFNLE9BQU8scUJBQXFCO0lBR3JCLEVBQUUsQ0FBb0Q7SUFFL0QsWUFBWSxFQUFxRDtRQUM3RCxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN2QixLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxDQUFDLG1CQUFtQixDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVELENBQUMscUJBQXFCLENBQUMsQ0FBRSxNQUFlO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBZSxFQUFFLEtBQWE7UUFDaEQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSjtBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsQ0FBcUMsQ0FBQztBQUV0Rzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0s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