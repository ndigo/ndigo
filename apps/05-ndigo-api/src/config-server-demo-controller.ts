/**
 * Config-server demo (AD-29 Wave 3).
 *
 * Serves `/api/config.json` — the self-served remote config document — and
 * `/api/config/remote` which reflects the LIVE resolved value from the
 * environment, so a change at the server + poll + refresh shows up through
 * the full `poll → refresh → @refreshScope` loop (the demo's stubbed
 * document is mutated by the demo spec to prove it).
 *
 * In production, point `NDIGO_CONFIG_SERVER_URL` at a real config server;
 * this endpoint exists so the demo runs with zero external infrastructure.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { AsApplicationContextAware, ApplicationContext } from '@ndigo/context';
import { getMapping, requestMapping } from '@ndigo/dispatcher';

/**
 * The mutable remote document this app serves (the self-served config
 * server's state). Boot reads it via `configServer`; the demo spec mutates
 * it to exercise the poll → rebind loop.
 */
export const REMOTE_DOCUMENT: Record<string, unknown> = {
    api: {
        message: 'hello from remote config',
    },
};

@requestMapping('/api')
export class ConfigServerDemoController extends AsApplicationContextAware(Object) {
    /**
     * The owning context, injected before refresh — used to read the
     * environment's live resolved value on demand.
     */
    #context?: ApplicationContext;

    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * The self-served remote config document (GET /api/config.json).
     */
    @getMapping('/config.json')
    configDocument() {
        return { ...REMOTE_DOCUMENT };
    }

    /**
     * The live resolved remote value (GET /api/config/remote).
     *
     * Reads `api.message` from the ENVIRONMENT (not controller state), so
     * after a remote change + poll + refresh this reflects the new value
     * exactly as bound `@configurationProperties` would.
     */
    @getMapping('/config/remote')
    remoteValue() {
        const message = this.#context?.environment.getProperty('api.message') ?? 'unset';
        return { message };
    }
}
