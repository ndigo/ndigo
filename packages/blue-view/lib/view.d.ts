/**
 * @author Jeff Rose
 */
import { JSONObject, MediaType, Serializable, Null } from '@blue/core';
export interface View {
    mediaType: MediaType;
    render(model: any, request: any): void;
}
declare const AbstractView_base: (new (...args: any[]) => import("@blue/factory").NameAware) & import("@blue/core").Constructable<import("@blue/context").ApplicationContextAware> & typeof Null;
export declare abstract class AbstractView extends AbstractView_base implements Serializable, View {
    mediaType: MediaType;
    name: string;
    get [Symbol.toStringTag](): string;
    constructor();
    render(model: any, request: any): void;
    toJSON(): JSONObject;
    toString(): string;
    protected _createViewModel(model: any, request: any): any;
    protected abstract _renderView(viewModel: any, request: any): void;
}
export declare abstract class AbstractPathBasedView extends AbstractView {
    path: string;
    get [Symbol.toStringTag](): string;
    constructor(path?: string);
    toJSON(): JSONObject;
}
export declare abstract class AbstractTemplateView extends AbstractPathBasedView {
    protected abstract _renderTemplate(templateModel: any, request: any): void;
}
/**
 * View for a web interaction. Implementations are responsible for rendering content, and exposing the model. A single view exposes multiple model attributes.
 *
 * View implementations may differ widely. This interface is designed to avoid restricting the range of possible implementations.
 *
 * They are likely to be instantiated by a {@link ViewResolver|`ViewResolver`} .
 */
/**
 * The media type of the view
 */
/**
 * Render the view given the specified model.
 * @param {*} model The data model
 * @param {*} request The current request
 */
/**
 * Abstract base class for {@link View|`View`} implementations. Subclasses need to implement the actual rendering.
 * @abstract
 * @implements module:view.View
 * @implements module:core.NameAware
 * @implements module:core.Serializable
 */
/**
 * Abstract base class for path-based views.
 * @abstract
 * @extends module:view.AbstractView
 */
/**
 * Abstract base class for template-based views.
 * @abstract
 * @extends module:view.AbstractPathBasedView
 */
/**
 * @abstract
 * @protected
 * @param {*} templateModel The template data model
 * @param {*} request The current request
 */
/**
 * View that reroutes to an absolute, context relative, or current request relative route.
 * @extends module:view.AbstractPathBasedView
 */
export declare class RerouteView extends AbstractPathBasedView {
    contextRelative: boolean;
    constructor(path: string, contextRelative?: boolean);
    protected _createTargetPath(model: any, request: any): string;
    protected _renderView(viewModel: any, request: any): void;
}
export {};
//# sourceMappingURL=view.d.ts.map