/**
 * @author Jeff Rose
 */

import { Application } from './application';
import { Router } from '@blue/router';

export class Site {
    #applications: Application[];
    #router: Router;

    get applications(): Application[] {
        return this.#applications;
    }

    get router(): Router {
        return this.#router;
    }

    constructor(router: Router, applications: Application[] = []) {
        this.#router = router;
        this.#applications = applications;
    }

    addApplication(application: Application): Site {
        this.#applications.push(application);
        return this;
    }
}
