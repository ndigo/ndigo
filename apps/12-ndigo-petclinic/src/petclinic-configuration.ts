/**
 * The PetClinic application assembly.
 *
 * One composition root: the seeded, in-memory clinic behind every page, the
 * message source the EJS locale helpers read, the four controllers, the static
 * asset controller, and the view resolver. Registered after
 * `NodeAutoConfiguration`, so it contributes beans without replacing any
 * platform default (the port comes from `process.env.PORT`, the error-resolver
 * chain and the argument resolvers stay the platform's).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { fileURLToPath } from 'node:url';
import { I18nextMessageSource } from '@ndigo/content-i18next';
import { configuration, entry } from '@ndigo/context';
import { ResponseStatuses } from '@ndigo/http';
import { FileSystemResourceLoader, StaticController } from '@ndigo/platform-node';
import { EJSViewResolver } from '@ndigo/view-ejs';
import { APIController } from './api-controller';
import { ClinicService } from './clinic-service';
import { createSeededRepository } from './clinic-repository';
import { MESSAGE_SOURCE } from './context-tokens';
import { HomeController } from './home-controller';
import { PETCLINIC_MESSAGES } from './messages';
import { OwnersController } from './owners-controller';
import { VetsController } from './vets-controller';
import { NOT_FOUND_VIEW, StatusViewResolver } from './views/status-view-resolver';

/** Absolute path of the `views/` directory (trailing separator included). */
const VIEWS = fileURLToPath(new URL('../views/', import.meta.url));

/** Absolute path of the `public/` directory the static controller serves. */
const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));

/** The PetClinic app's beans. */
@configuration
export class PetClinicConfiguration {
    // The composition root: one seeded repository, one service over it, shared
    // by every controller.
    readonly #service = new ClinicService(createSeededRepository());

    // One message source for the whole app: the templates resolve their keys
    // through it in the request's negotiated language, and the Zod form
    // schemas name their keys.
    readonly #messages = new I18nextMessageSource({
        resources: PETCLINIC_MESSAGES,
        language: 'en',
        fallbackLanguage: 'en',
    });

    /**
     * The application message source, installed on the context by the bootstrap
     * (`context.setMessageSource`).
     *
     * @returns The i18next-backed message source.
     */
    @entry(MESSAGE_SOURCE)
    messageSource() {
        return this.#messages;
    }

    /**
     * The welcome page.
     *
     * @returns The controller.
     */
    @entry()
    homeController() {
        return new HomeController(this.#service);
    }

    /**
     * Owners, pets and visits — the app's five forms and two read pages.
     *
     * @returns The controller.
     */
    @entry()
    ownersController() {
        return new OwnersController(this.#service);
    }

    /**
     * The vet directory.
     *
     * @returns The controller.
     */
    @entry()
    vetsController() {
        return new VetsController(this.#service);
    }

    /**
     * The JSON representations under `/api`.
     *
     * @returns The controller.
     */
    @entry()
    apiController() {
        return new APIController(this.#service);
    }

    /**
     * Resolves view names to EJS templates in `views/`, with the 404 page
     * served at the status it names. Reads templates through the framework
     * `ResourceLoader` seam, so pages run the full source → engine → producer
     * pipeline.
     *
     * @returns The configured resolver.
     */
    @entry()
    viewResolver() {
        const loader = new FileSystemResourceLoader();
        return new StatusViewResolver(new EJSViewResolver({ loader, prefix: VIEWS, suffix: '.ejs' }), {
            prefix: VIEWS,
            suffix: '.ejs',
            loader,
            statuses: { [NOT_FOUND_VIEW]: ResponseStatuses.NOT_FOUND.code },
        });
    }

    /**
     * Serves the app's stylesheet and logo from `public/` under `/static/…`.
     *
     * @returns The static asset controller.
     */
    @entry()
    staticController() {
        return new StaticController(PUBLIC);
    }
}
