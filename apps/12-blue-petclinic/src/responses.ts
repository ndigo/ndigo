/**
 * Response helpers: the app's two "not found" idioms and its POST-redirect.
 *
 * The reference app answers a missing owner or pet with a rendered 404 page,
 * while the JSON representations under `/api` answer with an RFC 9457 problem
 * document. Both live here so every handler spells them the same way, and so
 * the controllers stay free of view construction: the page helper returns a
 * *view name* (the resolver owns the template and the status), and the API
 * helper returns the framework's problem entity.
 *
 * @module blue-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ModelAndView } from '@blue/dispatcher';
import { HTTPHeaders, ResponseStatuses } from '@blue/http';
import { ResponseEntity, problemEntity, ProblemTypes, type ProblemDetails } from '@blue/platform-node';
import { NOT_FOUND_VIEW } from './views/status-view-resolver';

/**
 * The post/redirect/get response the form handlers return on success: a `302`
 * to the owner's detail page, so a reload never re-submits the form.
 *
 * @param location - The redirect target.
 * @returns The redirect response entity.
 */
export function redirectTo(location: string): ResponseEntity<undefined> {
    return new ResponseEntity(undefined, ResponseStatuses.FOUND, { [HTTPHeaders.LOCATION.name]: location });
}

/**
 * The rendered 404 page for a missing owner or pet. The view name is the one
 * the status-bearing view resolver serves with a `404`.
 *
 * @param resource - The resource kind named in the message (`owner`, `pet`).
 * @param id - The id that was asked for.
 * @returns The page's model and view.
 */
export function missingPage(resource: string, id: string): ModelAndView {
    return new ModelAndView(NOT_FOUND_VIEW, { resource, id });
}

/**
 * The `404` problem document the `/api` representations answer with.
 *
 * @param detail - What was not found (never internal state).
 * @param instance - The request path that missed.
 * @returns The problem entity.
 */
export function missingResource(detail: string, instance: string): ResponseEntity<ProblemDetails> {
    return problemEntity(ResponseStatuses.NOT_FOUND, {
        type: ProblemTypes.notFound,
        title: 'Not Found',
        status: 404,
        detail,
        instance,
    });
}
