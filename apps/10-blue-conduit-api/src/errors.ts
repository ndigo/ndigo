/**
 * The RealWorld error envelope.
 *
 * Every 4xx response in this app is `{"errors":{"<field>":["<message>", …]}}`
 * — the shape the official RealWorld collection asserts, and *not* the
 * framework's RFC 9457 `application/problem+json` document. The framework's
 * `ResponseEntityView` rewrites any `>=400` entity into a problem document,
 * so the envelope is produced by a {@link ProducerView} instead:
 * `ConduitErrorView` is returned straight from a handler (or from the
 * registered error resolver) and writes the exact body, status and
 * `application/json` content type.
 *
 * Zod schema failures reaching the parameter-binding error resolver are
 * translated here: each issue's leaf path becomes the envelope key, so
 * `{article:{title:""}}` reports as `{"errors":{"title":["can't be blank"]}}`
 * — the field name the collection expects, not the nested wire path.
 *
 * @module blue-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MediaTypes } from '@blue/core';
import {
    AbstractRouteErrorResolver,
    ParameterBindingError,
    ParameterConversionError,
    ZodValidationError,
    type ModelAndView,
    type ValidationIssue,
} from '@blue/dispatcher';
import type { Route } from '@blue/router';
import type { ProducerView, RenderResult } from '@blue/view';

/** The RealWorld `errors` member: field name → failure messages. */
export interface ConduitErrors {
    [field: string]: string[];
}

/**
 * Renders the RealWorld error envelope verbatim at a given HTTP status.
 *
 * Returning this from a handler bypasses `ResponseEntityView`'s problem+json
 * rewrite deliberately — see the module docs.
 */
export class ConduitErrorView implements ProducerView {
    readonly #status: number;
    readonly #errors: ConduitErrors;

    /**
     * Creates the error view.
     *
     * @param status - The HTTP status to answer with.
     * @param errors - The `errors` member to serialize.
     */
    constructor(status: number, errors: ConduitErrors) {
        this.#status = status;
        this.#errors = errors;
    }

    /**
     * Produces the complete response document.
     *
     * @returns The serialized `{errors}` body at the configured status.
     */
    async renderTo(): Promise<RenderResult> {
        return {
            status: this.#status,
            headers: { 'Content-Type': String(MediaTypes.APPLICATION_JSON) },
            body: JSON.stringify({ errors: this.#errors }),
        };
    }
}

/**
 * A `401` for a request whose `Authorization: Token …` header is absent.
 *
 * @returns The response view.
 */
export function tokenMissing(): ConduitErrorView {
    return new ConduitErrorView(401, { token: ['is missing'] });
}

/**
 * A `401` for a request whose `Authorization: Token …` header is present but
 * does not carry a verifiable, unexpired JWT for a known account.
 *
 * @returns The response view.
 */
export function tokenInvalid(): ConduitErrorView {
    return new ConduitErrorView(401, { token: ['is invalid'] });
}

/**
 * A `403` whose key names the resource type the caller may not modify.
 *
 * @param resource - The resource type (`article`, `comment`, …).
 * @returns The response view.
 */
export function forbidden(resource: string): ConduitErrorView {
    return new ConduitErrorView(403, { [resource]: ['forbidden'] });
}

/**
 * A `404` whose key names the resource type that was not found.
 *
 * @param resource - The resource type (`article`, `profile`, `comment`, …).
 * @returns The response view.
 */
export function notFound(resource: string): ConduitErrorView {
    return new ConduitErrorView(404, { [resource]: ['not found'] });
}

/**
 * Projects Zod validation issues onto the RealWorld envelope: the **leaf**
 * path segment is the key (issues carry the wire path, e.g.
 * `['article','title']`, while the collection asserts `title`), and issues
 * with no path fall back to `body`.
 *
 * @param issues - The structured Zod issues.
 * @returns The envelope member.
 */
export function envelopeForIssues(issues: readonly ValidationIssue[]): ConduitErrors {
    const errors: ConduitErrors = {};
    for (const issue of issues) {
        const key = issue.path.length > 0 ? String(issue.path[issue.path.length - 1]) : 'body';
        (errors[key] ??= []).push(issue.message);
    }
    return errors;
}

/**
 * The first link in this app's resolver chain: turns framework parameter
 * binding/validation failures into the RealWorld 422 envelope instead of the
 * framework's problem+json document.
 *
 * A Zod failure keeps its per-field messages; any other binding failure
 * (missing or unconvertible parameter) reports under `body`, since it has no
 * field to attribute.
 */
export class ConduitValidationErrorResolver extends AbstractRouteErrorResolver {
    /**
     * Maps a binding failure to a `422` RealWorld envelope.
     *
     * @param _route - The failed route (unused: the envelope carries no instance).
     * @param _handler - The handler being executed (unused).
     * @param error - The thrown error.
     * @returns The envelope view, or `null` for non-binding errors.
     */
    protected _resolveError(_route: Route, _handler: object | null, error: Error): ModelAndView | null {
        if (!(error instanceof ParameterBindingError)) {
            return null;
        }
        const cause = error instanceof ParameterConversionError ? error.cause : null;
        const errors =
            cause instanceof ZodValidationError ? envelopeForIssues(cause.issues) : { body: [error.message] };
        // The chain's contract is `ModelAndView`, while the RealWorld envelope
        // needs the producer path to escape the framework's problem+json
        // rewrite — the two shapes are structurally unrelated, so the
        // deliberate mismatch is cast here (the dispatcher renders any value
        // with `renderTo` through the producer branch).
        const view: ModelAndView = new ConduitErrorView(422, errors) as unknown as ModelAndView;
        return view;
    }
}
