/**
 * The welcome page.
 *
 * The one screen that is not a resource: it links the three sections the app
 * serves (owners, a new owner, the vet list) and reports the seeded counts, so
 * a booted server is self-describing.
 *
 * @module blue-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, ModelAndView, requestMapping } from '@blue/dispatcher';
import { ClinicService } from './clinic-service';

/** The site root. */
@requestMapping('/')
export class HomeController {
    readonly #clinic: ClinicService;

    /**
     * @param clinic - The domain service the counts come from.
     */
    constructor(clinic: ClinicService) {
        this.#clinic = clinic;
    }

    /** `GET /` — the welcome page. */
    @getMapping('/')
    index() {
        return new ModelAndView('welcome', { counts: this.#clinic.counts() });
    }
}
