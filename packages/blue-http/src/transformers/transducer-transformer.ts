/**
 * @author Jeff Rose
 */

import { transduce } from '@blue/util/list';
import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Transducer function applied to a reducing function.
 */
type Transducer = (xf: unknown) => unknown;

/**
 * Transforms iterable bodies using a transducer pipeline.
 */
export class TransducerTransformer<TInput = unknown, TOutput = unknown> implements HTTPTransformer<TInput, TOutput> {
    readonly #transducer: Transducer;
    readonly #condition?: (body: TInput, context: TransformContext) => boolean;

    /**
     * Creates a transducer-backed transformer.
     *
     * @param transducer - The transducer to apply.
     * @param condition - Optional predicate that controls whether the transform runs.
     */
    constructor(transducer: Transducer, condition?: (body: TInput, context: TransformContext) => boolean) {
        this.#transducer = transducer;
        this.#condition = condition;
    }

    /**
     * Tests whether the input is iterable and should be transformed.
     *
     * @param body - The body to inspect.
     * @param context - The current transform context.
     * @returns `true` when transformation should run.
     */
    canTransform(body: TInput, context: TransformContext): boolean {
        const value = body as unknown;

        if (
            !Array.isArray(value) &&
            (value == null || typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] !== 'function')
        ) {
            return false;
        }

        return this.#condition ? this.#condition(body, context) : true;
    }

    /**
     * Applies the transducer to the iterable body.
     *
     * @param body - The iterable body to transform.
     * @param context - The current transform context.
     * @returns The transformed iterable contents.
     */
    transform(body: TInput, context: TransformContext): TOutput {
        const result = transduce(
            this.#transducer,
            (accumulator: unknown[], current: unknown) => {
                accumulator.push(current);
                return accumulator;
            },
            [],
            body as never
        );

        return result as TOutput;
    }
}
