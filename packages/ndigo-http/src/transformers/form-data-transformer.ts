/**
 * @module ndigo-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Transforms a single `FormData` entry.
 */
export type FormDataEntryTransform = (key: string, value: FormDataEntryValue) => [string, FormDataEntryValue] | null;

/**
 * Transforms `FormData` entries one by one while preserving multipart semantics.
 */
export class FormDataTransformer implements HTTPTransformer<FormData, FormData> {
    readonly #entryTransform: FormDataEntryTransform;
    readonly #condition?: (body: FormData, context: TransformContext) => boolean;

    /**
     * Creates a `FormData` transformer.
     *
     * @param entryTransform - The per-entry transform to apply.
     * @param condition - Optional predicate that controls whether the transform runs.
     */
    constructor(
        entryTransform: FormDataEntryTransform,
        condition?: (body: FormData, context: TransformContext) => boolean
    ) {
        this.#entryTransform = entryTransform;
        this.#condition = condition;
    }

    /**
     * Tests whether the input is a `FormData` value that should be transformed.
     *
     * @param body - The body to inspect.
     * @param context - The current transform context.
     * @returns `true` when transformation should run.
     */
    canTransform(body: FormData, context: TransformContext): boolean {
        if (!(body instanceof FormData)) {
            return false;
        }

        return this.#condition ? this.#condition(body, context) : true;
    }

    /**
     * Applies the entry transform to each `FormData` item.
     *
     * @param body - The `FormData` to transform.
     * @param context - The current transform context.
     * @returns A new `FormData` instance.
     */
    transform(body: FormData, context: TransformContext): FormData {
        const transformed = new FormData();

        for (const [key, value] of body.entries()) {
            const result = this.#entryTransform(key, value);
            if (result !== null) {
                transformed.append(result[0], result[1]);
            }
        }

        return transformed;
    }
}
