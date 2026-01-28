/**
 * @author Jeff Rose
 */
import { AsNameAware } from '@blue/factory';
import { MediaTypes, createNull, Null } from '@blue/core';
import { AsApplicationContextAware } from '@blue/context';
import { toMatrixString, toQueryString } from '@blue/router';
export class AbstractView extends AsNameAware(AsApplicationContextAware(Null)) {
    mediaType;
    name;
    get [Symbol.toStringTag]() {
        return `View:${this.name}`;
    }
    constructor() {
        super();
        this.mediaType = MediaTypes.TEXT_HTML.withCharset('UTF-8');
    }
    render(model, request) {
        const viewModel = this._createViewModel(model, request);
        this._renderView(viewModel, request);
    }
    toJSON() {
        const json = createNull();
        json.name = this.name;
        json.mediaType = this.mediaType.toJSON();
        return json;
    }
    toString() {
        return this.name;
    }
    _createViewModel(model, request) {
        return model;
    }
}
// TODO Implement Initializable?
export class AbstractPathBasedView extends AbstractView {
    path;
    get [Symbol.toStringTag]() {
        return `PathBasedView:${this.path}`;
    }
    constructor(path = null) {
        super();
        if (path) {
            Reflect.defineProperty(this, 'path', {
                value: path,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    }
    toJSON() {
        const json = super.toJSON();
        json.path = this.path;
        return json;
    }
}
export class AbstractTemplateView extends AbstractPathBasedView {
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
export class RerouteView extends AbstractPathBasedView {
    contextRelative;
    constructor(path, contextRelative = false) {
        super(path);
        this.contextRelative = contextRelative;
    }
    _createTargetPath(model, request) {
        const data = this.contextRelative ? toMatrixString(model) : toQueryString(model);
        return `${this.path}${data}`;
    }
    _renderView(viewModel, request) {
        const targetPath = this._createTargetPath(viewModel, request);
        // TODO USE ROUTER
        history.pushState(null, null, targetPath);
    }
}
/*
export interface View extends NameAware {
    id: number;
    mediaType: MediaType;
    timestamp: number;
    context: Context;
    // TODO: Make model into a more formal thing
    model: { [ key: string ]: any };
    spec: { [ key: string ]: any };

    destroy(): void | boolean | Promise<any>;
    trigger( name: string, data: JSONObject ): void;
    onData( name: string, handler: Function, options?: { [ key: string ]: any } ): Function;
    onInit?(): void;
    onDestroy?(): void;
}

// Path-based views
export interface PathBasedView extends View {
    path: string;
}

export interface TemplateView extends PathBasedView {
    readonly template: any;
    rendered: Deferred<any>;

    render( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void>;
}

export interface WebView extends PathBasedView {
    target: Element;
    element: Element;

    appendTo( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void>;
    replaceIn( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void>;
}
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQXlCLFVBQVUsRUFBZ0IsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMvRixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFPN0QsTUFBTSxPQUFnQixZQUFhLFNBQVEsV0FBVyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25GLFNBQVMsQ0FBWTtJQUNyQixJQUFJLENBQVM7SUFFYixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRDtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQVUsRUFBRSxPQUFZO1FBQzNCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELE1BQU07UUFDRixNQUFNLElBQUksR0FBZSxVQUFVLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxRQUFRO1FBQ0osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFUyxnQkFBZ0IsQ0FBQyxLQUFVLEVBQUUsT0FBWTtRQUMvQyxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBR0o7QUFFRCxnQ0FBZ0M7QUFDaEMsTUFBTSxPQUFnQixxQkFBc0IsU0FBUSxZQUFZO0lBQzVELElBQUksQ0FBUztJQUViLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsWUFBWSxPQUFlLElBQUk7UUFDM0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1AsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO2dCQUNqQyxLQUFLLEVBQUUsSUFBSTtnQkFDWCxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFFBQVEsRUFBRSxLQUFLO2FBQ2xCLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTTtRQUNGLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFnQixvQkFBcUIsU0FBUSxxQkFBcUI7Q0FFdkU7QUFFRDs7Ozs7O0dBTUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7R0FJRztBQUVIOzs7OztHQUtHO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFdBQVksU0FBUSxxQkFBcUI7SUFDbEQsZUFBZSxDQUFVO0lBRXpCLFlBQVksSUFBWSxFQUFFLGtCQUEyQixLQUFLO1FBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQzNDLENBQUM7SUFFUyxpQkFBaUIsQ0FBQyxLQUFVLEVBQUUsT0FBWTtRQUNoRCxNQUFNLElBQUksR0FBVyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RixPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRVMsV0FBVyxDQUFDLFNBQWMsRUFBRSxPQUFZO1FBQzlDLE1BQU0sVUFBVSxHQUFXLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdEUsa0JBQWtCO1FBQ2xCLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBQ0o7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBb0NFIn0=