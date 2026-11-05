/**
 * AD-76 demo wiring: the actuator-parity endpoints (`/loggers`, `/env`,
 * `/configprops`) run exposed so the ndigo-api demo serves the full
 * management surface; `/configprops` enumerates the app's own
 * `@configurationProperties` classes. The endpoints' exposure is opt-in —
 * a production app would keep `["health","metrics"]` and add what it needs
 * behind the `accessGuard` + boundary-firewall posture (AD-36).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ManagementAutoConfiguration } from '@ndigo/management';
import { ServerConfig, SecretsConfig } from './server-config';

/**
 * The demo-facing management auto-configuration: every endpoint exposed,
 * declared configuration classes listed for `/configprops`.
 */
export class ManagementConfiguration extends ManagementAutoConfiguration {
    /**
     * @since 1.0.0
     */
    constructor() {
        super({
            exposure: { include: ['*'] },
            configurationClasses: [ServerConfig, SecretsConfig],
        });
    }
}
