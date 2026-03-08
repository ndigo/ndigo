/**
 * @author Jeff Rose
 */

import { pipe } from '@blue/util/function';
import { HTTPTransformer, TransformContext } from './http-transformer';

export class CompositionTransformer<TInput = unknown, TOutput = unknown> implements HTTPTransformer<TInput, TOutput> {
    readonly #pipeline: (input: TInput) => TOutput;
    readonly #condition?: (body: TInput, context: TransformContext) => boolean;

    constructor(
        transforms: Array<(value: unknown) => unknown>,
        condition?: (body: TInput, context: TransformContext) => boolean
    ) {
        this.#pipeline = pipe(...transforms) as (input: TInput) => TOutput;
        this.#condition = condition;
    }

    canTransform(body: TInput, context: TransformContext): boolean {
        return this.#condition ? this.#condition(body, context) : true;
    }

    transform(body: TInput, context: TransformContext): TOutput {
        return this.#pipeline(body);
    }
}
