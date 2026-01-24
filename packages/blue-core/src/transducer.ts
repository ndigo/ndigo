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

export interface CompletingTransformer<TResult, TComplete, TInput> {
    [ '@@transducer/init' ]?(): TResult;
    [ '@@transducer/result' ]?( result: TResult ): TComplete;
    [ '@@transducer/step' ]( result: TResult, input: TInput ): MaybeReduced<TResult>;
};

export type Transformer<TResult = any, TInput = any> = CompletingTransformer<TResult, TResult, TInput>;

export type Reduced<T> = {
    [ '@@transducer/reduced' ]: boolean;
    [ '@@transducer/value' ]: T;
};

export type MaybeReduced<T = any> = T | Reduced<T>;

export type QuittingReducer<TResult = any, TInput = any> = ( result: TResult, input: TInput ) => MaybeReduced<TResult>;

// TODO This type doesn't seem to be correct or at least TypeScript doesn't seem to like it when I apply it. I have not managed to figure it out. -JBR
export type Transducer<TInput = any, TOutput = any> = <TComplete, TResult = any>( xf?: CompletingTransformer<TResult, TComplete, TOutput> ) => CompletingTransformer<TResult, TComplete, TInput>;

export class DelegatingTransformer<TResult, TComplete, TInput> implements CompletingTransformer<TResult, TComplete, TInput> {
    readonly xf: CompletingTransformer<TResult, TComplete, TInput>;

    constructor( xf: CompletingTransformer<TResult, TComplete, TInput> ){
        defineProperty( this, 'xf', {
            value: xf,
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    [ '@@transducer/init' ]?(): TResult {
        return this.xf[ '@@transducer/init' ]();
    }

    [ '@@transducer/result' ]?( result: TResult ): TComplete {
        return this.xf[ '@@transducer/result' ]( result );
    }

    [ '@@transducer/step' ]( result: TResult, input: TInput ): MaybeReduced<TResult> {
        return this.xf[ '@@transducer/step' ]( result, input );
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
export const likeReduced = like( { '@@transducer/reduced': true } ) as ( value ) => value is Reduced<any>;

/**
 * Determines whether a value is a transformer.
 * @function module:core.likeTransformer
 * @param {*} value The value being checked.
 * @return {boolean} Whether or not the value is a transformer.
 */
export const likeTransformer = like( { '@@transducer/step': Function } ) as ( value ) => value is Transformer<any,any>;

/**
 * @param {*} value The value being reduced.
 */
export function reduce<T = any>( value: T ): Reduced<T> {
    return likeReduced( value ) ?
        value :
        {
            [ '@@transducer/reduced' ]: true,
            [ '@@transducer/value' ]: value
        };
}

export class XCount<T = any> implements Transformer<number, T> {
    [ '@@transducer/init' ]?(): number {
        return 0;
    }

    [ '@@transducer/result' ]?( result: number ): number {
        return result;
    }

    [ '@@transducer/step' ]( result: number ): MaybeReduced<number> {
        return result + 1;
    }
}

export const xCount = <T = any>(): Transformer<number, T> => new XCount<T>();

export const count = () => xCount;

export class XToArray<T = any> implements Transformer<T[], T> {
    [ '@@transducer/init' ]?(): T[] {
        return [];
    }

    [ '@@transducer/result' ]?( result: T[] ): T[] {
        return result;
    }

    [ '@@transducer/step' ]( result: T[], input: T ): MaybeReduced<T[]> {
        result.push( input );
        return result;
    }
}

export const xToArray = <T = any>(): Transformer<T[], T> => new XToArray<T>();

export const toArray = () => xToArray;

export class XToMap<T, K, V> implements Transformer<Map<K, V>, T> {
    private readonly _getKey: ( item: T ) => K;
    private readonly _getValue: ( item: T ) => V;

    constructor( getKey: ( item: T ) => K, getValue: ( item: T ) => V ){
        defineProperty( this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false
        } );
        defineProperty( this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    [ '@@transducer/init' ]?(): Map<K, V> {
        return new Map<K, V>();
    }

    [ '@@transducer/result' ]?( result: Map<K, V> ): Map<K, V> {
        return result;
    }

    [ '@@transducer/step' ]( result: Map<K, V>, input: T ): MaybeReduced<Map<K, V>> {
        result.set( this._getKey( input ), this._getValue( input ) );
        return result;
    }
}

export const toMap = <T, K, V>( getKey: ( item: T ) => K, getValue: ( item: T ) => V ) => (): Transformer<Map<K, V>, T> => new XToMap<T, K, V>( getKey, getValue );

export class XToMultiValueMap<T, K, V> implements Transformer<MultiValueMap<K, V>, T> {
    private readonly _getKey: ( item: T ) => K;
    private readonly _getValue: ( item: T ) => V;

    constructor( getKey: ( item: T ) => K, getValue: ( item: T ) => V ){
        defineProperty( this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false
        } );
        defineProperty( this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    [ '@@transducer/init' ]?(): MultiValueMap<K, V> {
        return new MultiValueMap<K, V>();
    }

    [ '@@transducer/result' ]?( result: MultiValueMap<K, V> ): MultiValueMap<K, V> {
        return result;
    }

    [ '@@transducer/step' ]( result: MultiValueMap<K, V>, input: T ): MaybeReduced<MultiValueMap<K, V>> {
        result.add( this._getKey( input ), this._getValue( input ) );
        return result;
    }
}

export const toMultiValueMap = <T, K, V>( getKey: ( item: T ) => K, getValue: ( item: T ) => V ) => (): Transformer<MultiValueMap<K, V>, T> => new XToMultiValueMap<T, K, V>( getKey, getValue );

export class XToRecord<T, U> implements Transformer<Record<string, U>, T> {
    private readonly _getKey: ( item: T ) => string;
    private readonly _getValue: ( item: T ) => U;

    constructor( getKey: ( item: T ) => string, getValue: ( item: T ) => U ){
        defineProperty( this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false
        } );
        defineProperty( this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    [ '@@transducer/init' ]?(): Record<string, U> {
        return {};
    }

    [ '@@transducer/result' ]?( result: Record<string, U> ): Record<string, U> {
        return result;
    }

    [ '@@transducer/step' ]( result: Record<string, U>, input: T ): MaybeReduced<Record<string, U>> {
        result[ this._getKey( input ) ] = this._getValue( input );
        return result;
    }
}

export const toRecord = <T, U>( getKey: ( item: T ) => string, getValue: ( item: T ) => U ) => (): Transformer<Record<string, U>, T> => new XToRecord<T, U>( getKey, getValue );

export class XToSet<T> implements Transformer<Set<T>, T> {
    readonly set: Set<T>;

    constructor( set: Set<T> = new Set<T>() ){
        this.set = set;
    }

    [ '@@transducer/init' ]?(): Set<T> {
        return this.set;
    }

    [ '@@transducer/result' ]?( result: Set<T> ): Set<T> {
        return result;
    }

    [ '@@transducer/step' ]( result: Set<T>, input: T ): MaybeReduced<Set<T>> {
        result.add( input );
        return result;
    }
}

export const toSet = <T = any>( set?: Set<T> ) => (): Transformer<Set<T>, T> => new XToSet<T>( set );

export const dispatchable = ( methodNames: string[], xf: Transducer, fn: Function ) => ( target: any, ...args: any[] ) => {
    // @ts-ignore: ¯\_(ツ)_/¯
    // eslint-disable-next-line no-undef
    if( arguments.length === 0 ){
        return fn();
    }

    if( !Array.isArray( target ) ){
        let index: number = 0;
        const length: number = methodNames.length;

        while( index < length ){
            const
                methodName: string = methodNames[ index ],
                method = target[ methodName ];
            if( typeof method === 'function' ){
                return method.apply( target, args );
            }
            index++;
        }

        if( likeTransformer( target ) ){
            const transducer: Transducer = xf.apply( null, args );
            return transducer( target );
        }

        // @ts-ignore: ¯\_(ツ)_/¯
        // eslint-disable-next-line no-undef
        return fn.apply( this, arguments );
    }
};

/**
 * * Developer Notes
 * ? Should this be in blue-util?
 */
