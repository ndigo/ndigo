/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Null } from '@ndigo/core';
import { AsApplicationContextAware } from './context-aware-mixin';

/**
 * Root of the component hierarchy: context-aware (`AsApplicationContextAware`)
 * and otherwise empty, so `BusinessComponent` and `ViewComponent` share one
 * ancestor without inheriting behavior.
 */
export class ApplicationComponent extends AsApplicationContextAware(Null) {}

/**
 * Base class for business logic components.
 * Encapsulates domain rules and state orchestration.
 */
export class BusinessComponent extends ApplicationComponent {}

/**
 * Base class for view components.
 * Encapsulates presentation logic and DOM interaction.
 */
export class ViewComponent extends ApplicationComponent {}
