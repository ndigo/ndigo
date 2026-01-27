/**
 * @author Jeff Rose
 * @see {@link https://github.com/cognitect-labs/transducers-js/issues/20}
 * @see {@link https://github.com/cognitect-labs/transducers-js#transformer-protocol}
 * @see {@link https://github.com/jlongster/transducers.js#the-transducer-protocol}
 * @see {@link https://github.com/dphilipson/transducist}
 */
import { MultiValueMap } from './collection';
export interface CompletingTransformer<TResult, TComplete, TInput> {
    ['@@transducer/init']?(): TResult;
    ['@@transducer/result']?(result: TResult): TComplete;
    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult>;
}
export type Transformer<TResult = any, TInput = any> = CompletingTransformer<TResult, TResult, TInput>;
export type Reduced<T> = {
    ['@@transducer/reduced']: boolean;
    ['@@transducer/value']: T;
};
export type MaybeReduced<T = any> = T | Reduced<T>;
export type QuittingReducer<TResult = any, TInput = any> = (result: TResult, input: TInput) => MaybeReduced<TResult>;
export type Transducer<TInput = any, TOutput = any> = <TComplete, TResult = any>(xf?: CompletingTransformer<TResult, TComplete, TOutput>) => CompletingTransformer<TResult, TComplete, TInput>;
export declare class DelegatingTransformer<TResult, TComplete, TInput> implements CompletingTransformer<TResult, TComplete, TInput> {
    readonly xf: CompletingTransformer<TResult, TComplete, TInput>;
    constructor(xf: CompletingTransformer<TResult, TComplete, TInput>);
    ['@@transducer/init']?(): TResult;
    ['@@transducer/result']?(result: TResult): TComplete;
    ['@@transducer/step'](result: TResult, input: TInput): MaybeReduced<TResult>;
}
/**
 * Determines whether an value is reduced. This is done using the transformer protocol; an object with the protocol-
 * specified `reduced` property is assumed to be reduced. If a result of a transformation is reduced, it means that the
 * transformation is complete and the channel should be closed.
 * @param {*} value The value being checked for reduction.
 * @returns {boolean} Whether ot not the value has been reduced.
 */
export declare const likeReduced: (value: any) => value is Reduced<any>;
/**
 * Determines whether a value is a transformer.
 * @param {*} value The value being checked.
 * @returns {boolean} Whether or not the value is a transformer.
 */
export declare const likeTransformer: (value: any) => value is Transformer<any, any>;
/**
 * @param {*} value The value being reduced.
 */
export declare function reduce<T = any>(value: T): Reduced<T>;
export declare class XCount<T = any> implements Transformer<number, T> {
    ['@@transducer/init']?(): number;
    ['@@transducer/result']?(result: number): number;
    ['@@transducer/step'](result: number): MaybeReduced<number>;
}
export declare const xCount: <T = any>() => Transformer<number, T>;
export declare const count: () => <T = any>() => Transformer<number, T>;
export declare class XToArray<T = any> implements Transformer<T[], T> {
    ['@@transducer/init']?(): T[];
    ['@@transducer/result']?(result: T[]): T[];
    ['@@transducer/step'](result: T[], input: T): MaybeReduced<T[]>;
}
export declare const xToArray: <T = any>() => Transformer<T[], T>;
export declare const toArray: () => <T = any>() => Transformer<T[], T>;
export declare class XToMap<T, K, V> implements Transformer<Map<K, V>, T> {
    private readonly _getKey;
    private readonly _getValue;
    constructor(getKey: (item: T) => K, getValue: (item: T) => V);
    ['@@transducer/init']?(): Map<K, V>;
    ['@@transducer/result']?(result: Map<K, V>): Map<K, V>;
    ['@@transducer/step'](result: Map<K, V>, input: T): MaybeReduced<Map<K, V>>;
}
export declare const toMap: <T, K, V>(getKey: (item: T) => K, getValue: (item: T) => V) => () => Transformer<Map<K, V>, T>;
export declare class XToMultiValueMap<T, K, V> implements Transformer<MultiValueMap<K, V>, T> {
    private readonly _getKey;
    private readonly _getValue;
    constructor(getKey: (item: T) => K, getValue: (item: T) => V);
    ['@@transducer/init']?(): MultiValueMap<K, V>;
    ['@@transducer/result']?(result: MultiValueMap<K, V>): MultiValueMap<K, V>;
    ['@@transducer/step'](result: MultiValueMap<K, V>, input: T): MaybeReduced<MultiValueMap<K, V>>;
}
export declare const toMultiValueMap: <T, K, V>(getKey: (item: T) => K, getValue: (item: T) => V) => () => Transformer<MultiValueMap<K, V>, T>;
export declare class XToRecord<T, U> implements Transformer<Record<string, U>, T> {
    private readonly _getKey;
    private readonly _getValue;
    constructor(getKey: (item: T) => string, getValue: (item: T) => U);
    ['@@transducer/init']?(): Record<string, U>;
    ['@@transducer/result']?(result: Record<string, U>): Record<string, U>;
    ['@@transducer/step'](result: Record<string, U>, input: T): MaybeReduced<Record<string, U>>;
}
export declare const toRecord: <T, U>(getKey: (item: T) => string, getValue: (item: T) => U) => () => Transformer<Record<string, U>, T>;
export declare class XToSet<T> implements Transformer<Set<T>, T> {
    readonly set: Set<T>;
    constructor(set?: Set<T>);
    ['@@transducer/init']?(): Set<T>;
    ['@@transducer/result']?(result: Set<T>): Set<T>;
    ['@@transducer/step'](result: Set<T>, input: T): MaybeReduced<Set<T>>;
}
export declare const toSet: <T = any>(set?: Set<T>) => () => Transformer<Set<T>, T>;
export declare const dispatchable: (methodNames: string[], xf: Transducer, fn: Function) => (target: any, ...args: any[]) => any;
/**
 * * Developer Notes
 * ? Should this be in blue-util?
 */
//# sourceMappingURL=transducer.d.ts.map