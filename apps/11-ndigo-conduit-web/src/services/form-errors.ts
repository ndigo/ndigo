/**
 * Form-scoped error state.
 *
 * The RealWorld API answers a failed write with one `{"errors":{…}}` envelope,
 * and a view must render it under the fields that caused it — but only on the
 * form that submitted. Several forms share a service (login and register share
 * the session; the editor and the comment box share the article), so the
 * envelope is stamped with the form that produced it: a login failure cannot
 * leak into the register form, and a stale envelope is ignored rather than
 * rendered.
 *
 * @module ndigo-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { signal, type Signal } from '@ndigo/signals';
import type { ConduitErrors } from '../lib/api/conduit-types';

/** Identifies the form an envelope belongs to. */
export type FormId = 'login' | 'register' | 'settings' | 'editor' | 'comment';

/** An envelope stamped with the form that produced it. */
export interface FormErrors {
    form: FormId;
    errors: ConduitErrors;
}

/**
 * Holds the most recent failure envelope for a group of forms.
 */
export class FormErrorState {
    readonly #state: Signal<FormErrors | null>;

    /**
     * Creates an empty state.
     *
     * @param initial - An optional envelope to start from.
     */
    constructor(initial: FormErrors | null = null) {
        this.#state = signal(initial);
    }

    /** The stamped envelope, or `null` when the last write succeeded. */
    get current(): FormErrors | null {
        return this.#state.value;
    }

    /**
     * Returns the envelope for one form, ignoring another form's failure.
     *
     * @param form - The form being rendered.
     * @returns The envelope, or `null` when this form has no current failure.
     */
    for(form: FormId): ConduitErrors | null {
        const current = this.#state.value;
        return current && current.form === form ? current.errors : null;
    }

    /**
     * Records a failure for a form.
     *
     * @param form - The form that failed.
     * @param errors - The RealWorld envelope it failed with.
     */
    set(form: FormId, errors: ConduitErrors): void {
        this.#state.value = { form, errors };
    }

    /** Clears the recorded failure. */
    clear(): void {
        this.#state.value = null;
    }
}
