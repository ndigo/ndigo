/**
 * @author Jeff Rose
 */

import { HTTPTransformer, TransformContext } from './http-transformer';

export type FormDataEntryTransform = (key: string, value: FormDataEntryValue) => [string, FormDataEntryValue] | null;

export class FormDataTransformer implements HTTPTransformer<FormData, FormData> {
    readonly #entryTransform: FormDataEntryTransform;
    readonly #condition?: (body: FormData, context: TransformContext) => boolean;

    constructor(
        entryTransform: FormDataEntryTransform,
        condition?: (body: FormData, context: TransformContext) => boolean
    ) {
        this.#entryTransform = entryTransform;
        this.#condition = condition;
    }

    canTransform(body: FormData, context: TransformContext): boolean {
        if (!(body instanceof FormData)) {
            return false;
        }

        return this.#condition ? this.#condition(body, context) : true;
    }

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
