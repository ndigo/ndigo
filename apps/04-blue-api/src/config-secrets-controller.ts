/**
 * At-rest secrets demo controller (AD-29 Wave 2).
 *
 * GET /api/config/secrets — returns `api.secretToken` bound from the
 * environment, gated behind the app's established Bearer-token demo auth
 * (SEC-4): a missing/unknown token is rejected with 401 before the bound
 * value is ever touched, mirroring the note controller's `lookupPrincipal`
 * gate. With `BLUE_SECRET_KEY` set and the token present as a `{cipher:...}`
 * marker, the value bound at bind time is the decrypted plaintext; without
 * decryption wiring the raw marker binds instead. Documents the two-channel
 * posture — ciphertext in one source, key in another — and that the plaintext
 * is served only to an authenticated demo caller.
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { AsApplicationContextAware, ApplicationContext, ApplicationContextAware } from '@blue/context';
import { getMapping, requestMapping, parameters, headerValue } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { HTTPHeaders } from '@blue/http';
import { SECRETS_CONFIG } from './server-config';
import { lookupPrincipal } from './auth-store';

@requestMapping('/api/config')
export class ConfigSecretsController extends AsApplicationContextAware(Object) implements ApplicationContextAware {
    /**
     * The owning context, injected before refresh. The `secretsConfig`
     * bean binds AFTER context refresh (AD-15: `@configurationProperties`
     * beans register post-refresh in `_prepareContext`), so the value is
     * resolved lazily at dispatch time rather than during injection.
     */
    #context?: ApplicationContext;

    setApplicationContext(context: ApplicationContext): void {
        this.#context = context;
    }

    /**
     * GET /api/config/secrets — Bearer-gated (SEC-4): mirrors the note
     * controller's demo gate, so the decrypted plaintext is never served
     * to an unauthenticated caller.
     */
    @getMapping('/secrets')
    @parameters({ token: headerValue('authorization') })
    async secrets(token: string | undefined) {
        const bearer = HTTPHeaders.AUTHORIZATION.bearerToken(token);
        if (!bearer || !(await lookupPrincipal(bearer))) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
        }
        const config = this.#context?.getValue(SECRETS_CONFIG);
        return { secretToken: config?.secretToken ?? 'unset' };
    }
}
