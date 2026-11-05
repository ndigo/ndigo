/**
 * The JSON representations — the same three resources the pages render.
 *
 * **The content-negotiation choice.** Strings, `ResponseEntity` and plain
 * objects are three different answers in the Node pipeline (a view name, a
 * status-bearing response, a JSON document), and the HTML pages and the API
 * documents do not share a model: a page model carries form state, message
 * keys and paging labels, while a resource document carries the reference
 * application's payload shape. So JSON is published under an explicit
 * `/api/...` mapping — the second option the task allows — rather than by
 * negotiating `Accept` on the page routes, which would have to re-project the
 * model per representation anyway. `ContentNegotiationViewResolver` remains
 * the framework mechanism for one model in several representations (see
 * `apps/07-ndigo-views`).
 *
 * A miss is an RFC 9457 problem document (`application/problem+json`) with the
 * framework's `urn:ndigo:not-found` type, the mirror of the 404 page the same
 * miss produces on the HTML routes.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, parameters, pathVariable, requestMapping, routeValue, validatedQuery } from '@ndigo/dispatcher';
import type { Route } from '@ndigo/router';
import { ClinicService } from './clinic-service';
import { ownerSearchSchema, vetSearchSchema, type OwnerSearch, type VetSearch } from './forms';
import { toOwnerDto, toVetDto } from './presenter';
import { toPositiveInt } from './request-values';
import { missingResource } from './responses';

/** The JSON API. */
@requestMapping('/api')
export class APIController {
    readonly #clinic: ClinicService;

    /**
     * @param clinic - The domain service every representation is read from.
     */
    constructor(clinic: ClinicService) {
        this.#clinic = clinic;
    }

    /**
     * `GET /api/owners?lastName=&page=` — the same search and paging the HTML
     * list pages through, serialized as owner documents.
     */
    @getMapping('/owners')
    @parameters({ search: validatedQuery(ownerSearchSchema) })
    owners(search: OwnerSearch) {
        const owners = this.#clinic.searchOwners(search.lastName, search.page);
        return {
            owners: owners.content.map((detail) => toOwnerDto(detail)),
            page: owners.page,
            size: owners.size,
            totalElements: owners.totalElements,
            totalPages: owners.totalPages,
        };
    }

    /** `GET /api/owners/:id` — one owner with its pets, visits and types. */
    @getMapping('/owners/:id')
    @parameters({ id: pathVariable('id'), route: routeValue() })
    owner(id: string, route: Route) {
        const ownerId = toPositiveInt(id);
        const detail = ownerId === undefined ? undefined : this.#clinic.ownerDetail(ownerId);
        return detail === undefined ? missingResource(`owner ${id} not found`, route.path) : toOwnerDto(detail);
    }

    /** `GET /api/vets?page=` — one page of vets, each with its specialties. */
    @getMapping('/vets')
    @parameters({ search: validatedQuery(vetSearchSchema) })
    vets(search: VetSearch) {
        const vets = this.#clinic.vetsPage(search.page);
        return {
            vets: vets.content.map((view) => toVetDto(view)),
            page: vets.page,
            size: vets.size,
            totalElements: vets.totalElements,
            totalPages: vets.totalPages,
        };
    }
}
