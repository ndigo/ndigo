/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Null } from '@blue/core';
import { AsApplicationContextAware } from './context-aware-mixin';

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
