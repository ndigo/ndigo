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
