/**
 * @author Jeff Rose
 */

import { transduce } from '@blue/util/list';
import { HTTPTransformer, TransformContext } from './http-transformer';

type Transducer = (xf: unknown) => unknown;

export class TransducerTransformer<TInput = unknown, TOutput = unknown> implements HTTPTransformer<TInput, TOutput> {
    readonly #transducer: Transducer;
    readonly #condition?: (body: TInput, context: TransformContext) => boolean;

    constructor(transducer: Transducer, condition?: (body: TInput, context: TransformContext) => boolean) {
        this.#transducer = transducer;
        this.#condition = condition;
    }

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
