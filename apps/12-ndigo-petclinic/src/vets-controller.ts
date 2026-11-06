/**
 * The vet list page.
 *
 * Vets are read-only in the reference application (there is no vet edit form),
 * so this is a single paged list: each row is a vet with its specialties, which
 * the app models as a `VetSpecialty` link row rather than a many-to-many
 * relation the in-memory manager cannot resolve.
 */
import { getMapping, ModelAndView, parameters, requestMapping, validatedQuery } from '@ndigo/dispatcher';
import { ClinicService } from './clinic-service';
import { vetSearchSchema, type VetSearch } from './forms';

/** The veterinarian directory. */
@requestMapping('/vets')
export class VetsController {
    readonly #clinic: ClinicService;

    /**
     * @param clinic - The domain service the vet list comes from.
     */
    constructor(clinic: ClinicService) {
        this.#clinic = clinic;
    }

    /** `GET /vets?page=` — one page of vets with their specialties. */
    @getMapping('/')
    @parameters({ search: validatedQuery(vetSearchSchema) })
    list(search: VetSearch) {
        const vets = this.#clinic.vetsPage(search.page);
        return new ModelAndView('vets/list', {
            vets: vets.content,
            page: vets.page,
            totalPages: vets.totalPages,
            totalElements: vets.totalElements,
            hasPrevious: vets.page > 1,
            hasNext: vets.page < vets.totalPages && vets.totalElements > 0,
        });
    }
}
