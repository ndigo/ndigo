/**
 * At-rest secrets demo controller (AD-29 Wave 2).
 *
 * GET /api/config/secrets — returns `api.secretToken` bound from the
 * environment. With `BLUE_SECRET_KEY` set and the token present as a
 * `{cipher:...}` marker, this reveals the plaintext decrypted at bind time;
 * without decryption wiring the raw marker binds instead. Documents the
 * two-channel posture: ciphertext in one source, key in another.
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import "@tsmetadata/polyfill";
import {
  AsApplicationContextAware,
  ApplicationContext,
  ApplicationContextAware,
} from "@blue/context";
import { getMapping, requestMapping } from "@blue/dispatcher";
import { SecretsConfig } from "./server-config";

@requestMapping("/api/config")
export class ConfigSecretsController
  extends AsApplicationContextAware(Object)
  implements ApplicationContextAware
{
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
   * GET /api/config/secrets
   */
  @getMapping("/secrets")
  secrets() {
    const config = this.#context?.getValue<SecretsConfig>("secretsConfig");
    return { secretToken: config?.secretToken ?? "unset" };
  }
}
