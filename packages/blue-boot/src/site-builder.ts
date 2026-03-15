/**
 * @author Jeff Rose
 */

import { Site } from './site';
import { Router } from '@blue/router';
import { Application } from './application';

export class SiteBuilder {
    #applications: Application[];
    #router: Router;

    constructor(router: Router = null) {
        this.#router = router;
        this.#applications = [];
    }

    application(application: Application): SiteBuilder {
        this.#applications.push(application);
        return this;
    }

    applications(...applications: Application[]): SiteBuilder {
        const length = applications.length;
        for (let index = 0; index < length; index++) {
            this.#applications.push(applications[index]);
        }
        return this;
    }

    build(): Site {
        return new Site(this.#router, [...this.#applications]);
    }

    router(router: Router): SiteBuilder {
        this.#router = router;
        return this;
    }
}
