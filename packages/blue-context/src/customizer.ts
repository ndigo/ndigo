import type { ConfigurableEnvironment } from './environment';

/**
 * Ordered hook that adjusts the environment after the standard sources are
 * wired and before the context reads it (AD-16 D2 — Spring's
 * `EnvironmentPostProcessor` analog, house-named `EnvironmentCustomizer`).
 *
 * Customizers run in registration order; a throwing customizer fails boot
 * loudly (a partial environment would poison later reads).
 */
export interface EnvironmentCustomizer {
    /**
     * Adjusts the fully-prepared environment: reorder/replace sources via
     * `getPropertySources()`, inject test doubles, or add a custom source.
     *
     * @param environment - The prepared environment (profiles, files, CLI,
     *   builder already applied).
     */
    customize(environment: ConfigurableEnvironment): void;
}

/**
 * Applies customizers in order.
 *
 * @param environment - The prepared environment.
 * @param customizers - The customizers to run (registration order).
 */
export function applyCustomizers(
    environment: ConfigurableEnvironment,
    customizers: readonly EnvironmentCustomizer[]
): void {
    for (const customizer of customizers) {
        customizer.customize(environment);
    }
}
