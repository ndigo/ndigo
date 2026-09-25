/**
 * Demonstration controller for the Node.js platform demo.
 * * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    getMapping,
    postMapping,
    parameters,
    queryValue,
    bodyValue,
    pathVariable,
    requestMapping,
    headerValue,
} from '@blue/dispatcher';
import { ModelAndView } from '@blue/dispatcher';
import type { ContentSource } from '@blue/content';

@requestMapping('/api')
export class GreetingController {
    readonly #content: ContentSource;

    constructor(contentSource: ContentSource) {
        this.#content = contentSource;
    }

    /**
     * Returns a greeting for the given name.
     * GET /api/hello?name=<name>
     */
    @getMapping('/hello')
    @parameters({ name: queryValue('name') })
    hello(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }

    /**
     * Accept-Language-aware greeting: resolves the first language tag from the
     * `Accept-Language` header (e.g. `de-DE,de;q=0.9` → `de`) and renders the
     * `greeting` content-key through a `ContentSource` (`@blue/content`) —
     * the i18n demo.
     *
     * GET /api/greeting?name=Ada   (Accept-Language: de → "Hallo, Ada!")
     */
    @getMapping('/greeting')
    @parameters({ name: queryValue('name'), languageTag: headerValue('accept-language') })
    greeting(name: string | undefined, languageTag: string | undefined) {
        const language = this.#languageOf(languageTag);
        const message = this.#content.getContent('greeting', language).replace('{name}', name ?? 'World');
        return { message, language };
    }

    /**
     * Echoes the request body back to the caller.
     * POST /api/echo
     */
    @postMapping('/echo')
    @parameters({ payload: bodyValue() })
    echo(payload: unknown) {
        return { echo: payload };
    }

    /**
     * Returns the given path segment.
     * GET /api/greet/:name
     */
    @getMapping('/greet/:name')
    @parameters({ name: pathVariable('name') })
    greet(name: string) {
        return { greeting: `Greetings, ${name}!` };
    }

    /**
     * The same report data through the content-negotiating view resolver:
     * JSON by default, CSV for the `.csv` path extension.
     */
    @getMapping('/report')
    report() {
        return this.#report();
    }

    @getMapping('/report.csv')
    reportCSV() {
        return this.#report();
    }

    #report(): ModelAndView {
        return new ModelAndView('report', {
            rows: [
                { name: 'Ada', role: 'admin' },
                { name: 'Grace', role: 'user' },
            ],
        });
    }

    /**
     * Extracts the primary language tag ("de" from "de-DE,de;q=0.9").
     * Full quality-factor negotiation exists in `@blue/core` — the demo
     * keeps the header parse minimal on purpose.
     */
    #languageOf(header: string | undefined): string {
        return header?.split(',')[0]?.trim().split('-')[0] ?? 'en';
    }
}
