/**
 * @author Jeff Rose
 * @see {@link https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d}
 * @see {@link https://vonheikemen.github.io/devlog/web-development/transducers-in-javascript/}
 * @see {@link https://github.com/cognitect-labs/transducers-js/issues/20}
 * @see {@link https://github.com/cognitect-labs/transducers-js#transformer-protocol}
 * @see {@link https://github.com/jlongster/transducers.js#the-transducer-protocol}
 * @see {@link https://github.com/dphilipson/transducist}
 */

import { like } from '@blue/util/types';
import { MultiValueMap } from './collection';

const defineProperty = Reflect.defineProperty;

/**
 * A transformer that follows the transducer protocol and optionally performs completion.
 */
export interface CompletingTransformer<TResult, TComplete, TInput> {
    /**
     * Creates the initial accumulator value.
     */
    ['@@transducer/init']?(): TResult;

    /**
     * Finalizes the accumulated result.
     */
    ['@@transducer/result']?(result: TResult): TComplete;

    /**
     * Applies one input value to the accumulator.
     */
    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult>;
}

/**
 * A standard transducer transformer.
 */
export type Transformer<TResult = any, TInput = any> = CompletingTransformer<TResult, TResult, TInput>;

/**
 * A value wrapped with the transducer protocol's reduced marker.
 */
export type Reduced<T> = {
    ['@@transducer/reduced']: boolean;
    ['@@transducer/value']: T;
};

/**
 * A value that may already be reduced.
 */
export type MaybeReduced<T = any> = T | Reduced<T>;

/**
 * A reducer that may short-circuit by returning a reduced value.
 */
export type QuittingReducer<TResult = any, TInput = any> = (result: TResult, input: TInput) => MaybeReduced<TResult>;

// TODO This type doesn't seem to be correct or at least TypeScript doesn't seem to like it when I apply it. I have not managed to figure it out. -JBR
/**
 * Builds a transformer from an optional completion-aware transformer.
 */
export type Transducer<TInput = any, TOutput = any> = <TComplete, TResult = any>(
    xf?: CompletingTransformer<TResult, TComplete, TOutput>
) => CompletingTransformer<TResult, TComplete, TInput>;

/**
 * Delegates the transducer protocol to another transformer.
 */
export class XDelegatingTransformer<TResult, TComplete, TInput>
    implements CompletingTransformer<TResult, TComplete, TInput>
{
    /** The wrapped transformer. */
    readonly xf: CompletingTransformer<TResult, TComplete, TInput>;

    /**
     * Creates a delegating transformer.
     *
     * @param xf - Transformer to delegate to.
     */
    constructor(xf: CompletingTransformer<TResult, TComplete, TInput>) {
        defineProperty(this, 'xf', {
            value: xf,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Delegates accumulator initialization to the wrapped transformer.
     */
    ['@@transducer/init']?(): TResult {
        return this.xf['@@transducer/init']();
    }

    /**
     * Delegates completion to the wrapped transformer.
     */
    ['@@transducer/result']?(result: TResult): TComplete {
        return this.xf['@@transducer/result'](result);
    }

    /**
     * Delegates stepping to the wrapped transformer.
     */
    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult> {
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
export const likeReduced = like({ '@@transducer/reduced': true }) as (value) => value is Reduced<any>;

/**
 * Determines whether a value is a transformer.
 * @param {*} value The value being checked.
 * @returns {boolean} Whether or not the value is a transformer.
 */
export const likeTransformer = like({ '@@transducer/step': Function }) as (value) => value is Transformer<any, any>;

/**
 * @param {*} value The value being reduced.
 */
export function reduce<T = any>(value: T): Reduced<T> {
    return likeReduced(value)
        ? value
        : {
              ['@@transducer/reduced']: true,
              ['@@transducer/value']: value,
          };
}

export class XCount<T = any> implements Transformer<number, T> {
    /**
     * Initializes the count.
     *
     * @returns Zero.
     */
    ['@@transducer/init']?(): number {
        return 0;
    }

    /**
     * Completes the count without modification.
     *
     * @param result - Current count.
     * @returns The final count.
     */
    ['@@transducer/result']?(result: number): number {
        return result;
    }

    /**
     * Increments the count for each input.
     *
     * @param result - Current count.
     * @returns The incremented count.
     */
    ['@@transducer/step'](result: number): MaybeReduced<number> {
        return result + 1;
    }
}

/**
 * Creates a counting transducer.
 *
 * @returns A transformer that counts inputs.
 */
export const xCount = <T = any>(): Transformer<number, T> => new XCount<T>();

/**
 * Returns a transducer factory for counting inputs.
 */
export const count = () => xCount;

/**
 * Collects incoming values into an array.
 */
export class XToArray<T = any> implements Transformer<T[], T> {
    /**
     * Initializes an empty array.
     *
     * @returns A new array.
     */
    ['@@transducer/init']?(): T[] {
        return [];
    }

    /**
     * Completes array collection without modification.
     *
     * @param result - Current array.
     * @returns The final array.
     */
    ['@@transducer/result']?(result: T[]): T[] {
        return result;
    }

    /**
     * Appends each input to the output array.
     *
     * @param result - Current array.
     * @param input - Input value.
     * @returns The mutated array.
     */
    ['@@transducer/step'](result: T[], input: T): MaybeReduced<T[]> {
        result.push(input);
        return result;
    }
}

/**
 * Creates an array-collecting transducer.
 *
 * @returns A transformer that accumulates values into an array.
 */
export const xToArray = <T = any>(): Transformer<T[], T> => new XToArray<T>();

/**
 * Returns a transducer factory for collecting values into an array.
 */
export const toArray = () => xToArray;

export class XToMap<T, K, V> implements Transformer<Map<K, V>, T> {
    private readonly _getKey: (item: T) => K;
    private readonly _getValue: (item: T) => V;

    constructor(getKey: (item: T) => K, getValue: (item: T) => V) {
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

    /**
     * Initializes an empty map.
     *
     * @returns A new map.
     */
    ['@@transducer/init']?(): Map<K, V> {
        return new Map<K, V>();
    }

    /**
     * Completes map collection without modification.
     *
     * @param result - Current map.
     * @returns The final map.
     */
    ['@@transducer/result']?(result: Map<K, V>): Map<K, V> {
        return result;
    }

    /**
     * Stores each input in the map under a derived key.
     *
     * @param result - Current map.
     * @param input - Input value.
     * @returns The mutated map.
     */
    ['@@transducer/step'](result: Map<K, V>, input: T): MaybeReduced<Map<K, V>> {
        result.set(this._getKey(input), this._getValue(input));
        return result;
    }
}

/**
 * Creates a map-collecting transducer factory.
 *
 * @param getKey - Function that derives the map key from each item.
 * @param getValue - Function that derives the map value from each item.
 * @returns A factory that produces a `Map`-collecting transformer.
 */
export const toMap =
    <T, K, V>(getKey: (item: T) => K, getValue: (item: T) => V) =>
    (): Transformer<Map<K, V>, T> =>
        new XToMap<T, K, V>(getKey, getValue);

/**
 * Collects incoming values into a `MultiValueMap` keyed by derived keys.
 */
export class XToMultiValueMap<T, K, V> implements Transformer<MultiValueMap<K, V>, T> {
    private readonly _getKey: (item: T) => K;
    private readonly _getValue: (item: T) => V;

    constructor(getKey: (item: T) => K, getValue: (item: T) => V) {
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

    /**
     * Initializes an empty multi-value map.
     *
     * @returns A new multi-value map.
     */
    ['@@transducer/init']?(): MultiValueMap<K, V> {
        return new MultiValueMap<K, V>();
    }

    /**
     * Completes multi-value map collection without modification.
     *
     * @param result - Current multi-value map.
     * @returns The final multi-value map.
     */
    ['@@transducer/result']?(result: MultiValueMap<K, V>): MultiValueMap<K, V> {
        return result;
    }

    /**
     * Adds each input to the grouped map value for its derived key.
     *
     * @param result - Current multi-value map.
     * @param input - Input value.
     * @returns The mutated multi-value map.
     */
    ['@@transducer/step'](result: MultiValueMap<K, V>, input: T): MaybeReduced<MultiValueMap<K, V>> {
        result.add(this._getKey(input), this._getValue(input));
        return result;
    }
}

/**
 * Creates a multi-value map-collecting transducer factory.
 *
 * @param getKey - Function that derives the map key from each item.
 * @param getValue - Function that derives the map value from each item.
 * @returns A factory that produces a `MultiValueMap`-collecting transformer.
 */
export const toMultiValueMap =
    <T, K, V>(getKey: (item: T) => K, getValue: (item: T) => V) =>
    (): Transformer<MultiValueMap<K, V>, T> =>
        new XToMultiValueMap<T, K, V>(getKey, getValue);

/**
 * Collects incoming values into a plain object record keyed by derived strings.
 */
export class XToRecord<T, U> implements Transformer<Record<string, U>, T> {
    private readonly _getKey: (item: T) => string;
    private readonly _getValue: (item: T) => U;

    constructor(getKey: (item: T) => string, getValue: (item: T) => U) {
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

    /**
     * Initializes an empty record.
     *
     * @returns A new record object.
     */
    ['@@transducer/init']?(): Record<string, U> {
        return {};
    }

    /**
     * Completes record collection without modification.
     *
     * @param result - Current record.
     * @returns The final record.
     */
    ['@@transducer/result']?(result: Record<string, U>): Record<string, U> {
        return result;
    }

    /**
     * Stores each input under a derived string key.
     *
     * @param result - Current record.
     * @param input - Input value.
     * @returns The mutated record.
     */
    ['@@transducer/step'](result: Record<string, U>, input: T): MaybeReduced<Record<string, U>> {
        result[this._getKey(input)] = this._getValue(input);
        return result;
    }
}

/**
 * Creates a record-collecting transducer factory.
 *
 * @param getKey - Function that derives the record key from each item.
 * @param getValue - Function that derives the record value from each item.
 * @returns A factory that produces a record-collecting transformer.
 */
export const toRecord =
    <T, U>(getKey: (item: T) => string, getValue: (item: T) => U) =>
    (): Transformer<Record<string, U>, T> =>
        new XToRecord<T, U>(getKey, getValue);

/**
 * Collects incoming values into a `Set`.
 */
export class XToSet<T> implements Transformer<Set<T>, T> {
    /** The underlying set being accumulated. */
    readonly set: Set<T>;

    /**
     * Creates a set-collecting transformer.
     *
     * @param set - Optional set to reuse as the accumulator.
     */
    constructor(set: Set<T> = new Set<T>()) {
        this.set = set;
    }

    /**
     * Initializes the set accumulator.
     *
     * @returns The configured set.
     */
    ['@@transducer/init']?(): Set<T> {
        return this.set;
    }

    /**
     * Completes set collection without modification.
     *
     * @param result - Current set.
     * @returns The final set.
     */
    ['@@transducer/result']?(result: Set<T>): Set<T> {
        return result;
    }

    /**
     * Adds each input to the set.
     *
     * @param result - Current set.
     * @param input - Input value.
     * @returns The mutated set.
     */
    ['@@transducer/step'](result: Set<T>, input: T): MaybeReduced<Set<T>> {
        result.add(input);
        return result;
    }
}

/**
 * Creates a set-collecting transducer factory.
 *
 * @param set - Optional set to reuse as the accumulator.
 * @returns A factory that produces a set-collecting transformer.
 */
export const toSet =
    <T = any>(set?: Set<T>) =>
    (): Transformer<Set<T>, T> =>
        new XToSet<T>(set);

/**
 * Builds a dispatching function that prefers target methods, then transducers, then a fallback implementation.
 *
 * @param methodNames - Methods to probe on the target, in priority order.
 * @param xf - Transducer factory used when the target is already a transformer.
 * @param fn - Fallback function.
 * @returns A dispatcher that routes the call based on the target type.
 */
export const dispatchable =
    (methodNames: string[], xf: Transducer, fn: Function) =>
    (target: any, ...args: any[]) => {
        // @ts-ignore: ¯\_(ツ)_/¯
        // eslint-disable-next-line no-undef
        if (arguments.length === 0) {
            return fn();
        }

        if (!Array.isArray(target)) {
            let index: number = 0;
            const length: number = methodNames.length;

            while (index < length) {
                const methodName: string = methodNames[index],
                    method = target[methodName];
                if (typeof method === 'function') {
                    return method.apply(target, args);
                }
                index++;
            }

            if (likeTransformer(target)) {
                const transducer: Transducer = xf.apply(null, args);
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
