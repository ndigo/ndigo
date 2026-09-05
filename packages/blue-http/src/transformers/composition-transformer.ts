import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Composes a sequence of body transforms into a single transformer.
 */
export class CompositionTransformer<TInput = unknown, TOutput = unknown> implements HTTPTransformer<TInput, TOutput> {
    readonly #pipeline: (input: TInput) => TOutput;
    readonly #condition?: (body: TInput, context: TransformContext) => boolean;

    /**
     * Creates a composed transformer.
     *
     * @param transforms - The transform pipeline to execute in order.
     * @param condition - Optional predicate that controls whether the pipeline runs.
     */
    constructor(
        transforms: Array<(value: unknown) => unknown>,
        condition?: (body: TInput, context: TransformContext) => boolean
    ) {
        const _pipe =
            (...fns: Array<(v: unknown) => unknown>) =>
            (x: unknown): unknown =>
                fns.reduce((v, f) => f(v), x);

        this.#pipeline = _pipe(...transforms) as (input: TInput) => TOutput;
        this.#condition = condition;
    }

    /**
     * Tests whether the pipeline should run for the current body.
     *
     * @param body - The body to inspect.
     * @param context - The current transform context.
     * @returns `true` when the pipeline should execute.
     */
    canTransform(body: TInput, context: TransformContext): boolean {
        return this.#condition ? this.#condition(body, context) : true;
    }

    /**
     * Applies the composed transform pipeline.
     *
     * @param body - The body to transform.
     * @param context - The current transform context.
     * @returns The transformed body.
     */
    transform(body: TInput, context: TransformContext): TOutput {
        return this.#pipeline(body);
    }
}
