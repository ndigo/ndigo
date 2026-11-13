/**
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { NameViewTargeter, RouteViewTargeter } from '@ndigo/view-webcomponent';

/**
 * Ndigo Views — centralized placement.
 *
 * The controller (unchanged) returns logical names. This configuration decides
 * where each result lands:
 *
 *   - `shell` and `footer` → named regions (view name → element id).
 *   - `/report`            → the sidebar (route pattern → element id).
 *   - everything else      → the application root, the dispatcher's fallback.
 *
 * Targeters are consulted in order and the first non-`null` target wins, so
 * name targeting is listed before the route catch-all. Neither targeter knows
 * about the other; a single entry can change a layout.
 */
@configuration
export class ViewsTargetingConfiguration {
    @entry()
    viewTargeters() {
        return [
            new NameViewTargeter({
                shell: '#app',
                footer: '#site-footer',
            }),
            new RouteViewTargeter({
                '/report': '#sidebar',
            }),
        ];
    }
}
