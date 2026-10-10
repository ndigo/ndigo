/**
 * Feature-flags demo controller (AD-82): a `@whenFeature`-gated route.
 *
 * The gate flag `gated.report` reads the config property
 * `feature.gated.report` (see `config/application.json`, flat dotted key)
 * — the `@blue/flags` local provider's zero-config channel. Flipping the
 * value in a config source + `environment.refresh()` gates the route
 * without a redeploy.
 *
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { whenFeature } from '@blue/flags';
import { requestMapping } from '@blue/dispatcher';

@requestMapping('/')
export class FeatureFlagController {
    /**
     * Gated report demo: 200 while `feature.gated.report` is truthy;
     * 404 (`urn:blue:not-found`) when it is off or absent.
     *
     * @returns The report payload.
     */
    @whenFeature('gated.report')
    @requestMapping('/gated-report')
    report() {
        return { report: 'feature-gated', feature: 'gated.report' };
    }
}
