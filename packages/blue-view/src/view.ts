/**
 * @author Jeff Rose
 */

import { AsNameAware } from '@blue/factory';
import { JSONObject, MediaType, MediaTypes, Serializable, createNull, Null } from '@blue/core';
import { AsApplicationContextAware } from '@blue/context';
import { toMatrixString, toQueryString } from '@blue/router';

import { ViewTarget } from './view-target';

export interface View {
    mediaType: MediaType;
    destroyed?: boolean;
    destroy?(): void | Promise<void>;
    render(model: any, request: any, target?: ViewTarget): void | Promise<void>;
}

export abstract class AbstractView extends AsNameAware(AsApplicationContextAware(Null)) implements Serializable, View {
    destroyed: boolean;
    mediaType: MediaType;
    name: string;

    get [Symbol.toStringTag](): string {
        return `View:${this.name}`;
    }

    constructor() {
        super();
        this.destroyed = false;
        this.mediaType = MediaTypes.TEXT_HTML.withCharset('UTF-8');
    }

    destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
    }

    async render(model: any, request: any, target?: ViewTarget): Promise<void> {
        if (this.destroyed) {
            return;
        }

        const viewModel = this._createViewModel(model, request);
        await this._renderView(viewModel, request, target);
    }

    toJSON(): JSONObject {
        const json: JSONObject = createNull();
        json.name = this.name;
        json.mediaType = this.mediaType.toJSON();
        return json;
    }

    toString(): string {
        return this.name;
    }

    protected _createViewModel(model: any, request: any): any {
        return model;
    }

    protected abstract _renderView(viewModel: any, request: any, target?: ViewTarget): void | Promise<void>;
}

// TODO Implement Initializable?
export abstract class AbstractPathBasedView extends AbstractView {
    path: string;

    get [Symbol.toStringTag](): string {
        return `PathBasedView:${this.path}`;
    }

    constructor(path: string = null) {
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

    toJSON(): JSONObject {
        const json = super.toJSON();
        json.path = this.path;
        return json;
    }
}

export abstract class AbstractTemplateView extends AbstractPathBasedView {
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
export class RerouteView extends AbstractPathBasedView {
    contextRelative: boolean;

    constructor(path: string, contextRelative: boolean = false) {
        super(path);
        this.contextRelative = contextRelative;
    }

    protected _createTargetPath(model: any, request: any): string {
        const data: string = this.contextRelative ? toMatrixString(model) : toQueryString(model);
        return `${this.path}${data}`;
    }

    protected _renderView(viewModel: any, request: any, target?: ViewTarget): void {
        const targetPath: string = this._createTargetPath(viewModel, request);

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
