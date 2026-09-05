/**
 * @author Jeff Rose
 */

import { AsNameAware } from '@blue/factory';
import { IllegalStateError, JSONObject, MediaType, MediaTypes, Serializable, createNull, Null } from '@blue/core';
import { AsApplicationContextAware } from '@blue/context';
import type { ApplicationContext } from '@blue/context';
import { toMatrixString, toQueryString, ROUTER } from '@blue/router';

import { ViewTarget } from './view-target.js';

/**
 * View for a web interaction. Implementations are responsible for rendering content, and exposing the model. A single view exposes multiple model attributes.
 *
 * View implementations may differ widely. This interface is designed to avoid restricting the range of possible implementations.
 *
 * They are likely to be instantiated by a {@link ViewResolver|`ViewResolver`} .
 */
export interface View {
    /**
     * The media type of the view.
     */
    mediaType: MediaType | null;
    /**
     * Indicates if the view has been destroyed.
     */
    destroyed?: boolean;
    /**
     * Destroys the view, releasing any resources.
     */
    destroy?(): void | Promise<void>;
    /**
     * Render the view given the specified model.
     * @param model The data model.
     * @param request The current request.
     * @param target The optional view target.
     */
    render(model: any, request: any, target?: ViewTarget): void | Promise<void>;
}

/**
 * Abstract base class for {@link View|`View`} implementations. Subclasses need to implement the actual rendering.
 * @abstract
 */
export abstract class AbstractView extends AsNameAware(AsApplicationContextAware(Null)) implements Serializable, View {
    /**
     * Indicates if the view has been destroyed.
     */
    destroyed: boolean;
    /**
     * The media type of the view.
     */
    mediaType: MediaType | null;
    /**
     * The name of the view.
     */
    name!: string;

    /**
     * Returns the string tag for this view.
     * @returns The string tag.
     */
    get [Symbol.toStringTag](): string {
        return `View:${this.name}`;
    }

    constructor() {
        super();
        this.destroyed = false;
        this.mediaType = MediaTypes.TEXT_HTML!.withCharset('UTF-8');
    }

    /**
     * Destroys the view, releasing any resources.
     */
    destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
    }

    /**
     * Render the view given the specified model.
     * @param model The data model.
     * @param request The current request.
     * @param target The optional view target.
     */
    async render(model: any, request: any, target?: ViewTarget): Promise<void> {
        if (this.destroyed) {
            return;
        }

        const viewModel = this._createViewModel(model, request);
        await this._renderView(viewModel, request, target);
    }

    /**
     * Returns a JSON representation of the view.
     * @returns A JSON object representing the view.
     */
    toJSON(): JSONObject {
        const json: JSONObject = createNull();
        json.name = this.name;
        json.mediaType = this.mediaType?.toJSON() ?? null;
        return json;
    }

    /**
     * Returns a string representation of the view.
     * @returns A string representing the view.
     */
    toString(): string {
        return this.name;
    }

    /**
     * Creates the view model from the given model and request.
     * @param model The data model.
     * @param request The current request.
     * @returns The created view model.
     * @protected
     */
    protected _createViewModel(model: any, request: any): any {
        return model;
    }

    /**
     * Renders the view with the given view model, request, and optional target.
     * @param viewModel The view model.
     * @param request The current request.
     * @param target The optional view target.
     * @protected
     * @abstract
     */
    protected abstract _renderView(viewModel: any, request: any, target?: ViewTarget): void | Promise<void>;
}

/**
 * Abstract base class for path-based views.
 * @abstract
 */
export abstract class AbstractPathBasedView extends AbstractView {
    /**
     * The path associated with the view.
     */
    path!: string;

    get [Symbol.toStringTag](): string {
        return `PathBasedView:${this.path}`;
    }

    constructor(path: string | null = null) {
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

    /**
     * Returns a JSON representation of the path-based view.
     * @returns A JSON object representing the path-based view.
     */
    toJSON(): JSONObject {
        const json = super.toJSON();
        json.path = this.path;
        return json;
    }
}

/**
 * Abstract base class for template-based views.
 * @abstract
 */
export abstract class AbstractTemplateView extends AbstractPathBasedView {
    /**
     * Creates the template model from the view model.
     * @param viewModel The view model.
     * @param request The current request.
     * @returns The template model.
     * @protected
     */
    protected _projectViewModel(viewModel: any, request: any): any {
        return viewModel;
    }

    /**
     * Renders the template with the given template model and request.
     * @param templateModel The template data model.
     * @param request The current request.
     * @param target The optional view target.
     * @protected
     * @abstract
     */
    protected abstract _renderTemplate(templateModel: any, request: any, target?: ViewTarget): void | Promise<void>;

    /**
     * Renders the view with the given view model.
     *
     * @param viewModel The view model to render.
     * @param request The current request.
     * @param target The optional view target (required for rendering).
     * @protected
     */
    protected async _renderView(viewModel: any, request: any, target?: ViewTarget): Promise<void> {
        if (!target) throw new IllegalStateError('View requires a ViewTarget to render.');

        const templateModel = this._projectViewModel(viewModel, request);
        await this._renderTemplate(templateModel, request, target);
    }
}

/**
 * View that reroutes to an absolute, context relative, or current request relative route.
 */
export class RerouteView extends AbstractPathBasedView {
    /**
     * The application context, provided by the mixin via `setApplicationContext`.
     * Declared here so TypeScript can see it through the mixin inheritance chain.
     */
    declare readonly applicationContext?: ApplicationContext;

    /**
     * Indicates if the reroute path is context relative.
     */
    contextRelative: boolean;

    /**
     * Creates a new RerouteView.
     * @param path The path to reroute to.
     * @param contextRelative True if the path is context relative, false otherwise.
     */
    constructor(path: string, contextRelative: boolean = false) {
        super(path);
        this.contextRelative = contextRelative;
    }

    /**
     * Creates the target path for rerouting.
     * @param model The data model.
     * @param request The current request.
     * @returns The created target path.
     * @protected
     */
    protected _createTargetPath(model: any, request: any): string {
        const data: string = this.contextRelative ? toMatrixString(model) : toQueryString(model);
        return `${this.path}${data}`;
    }

    /**
     * Renders the view by rerouting to the target path.
     *
     * Delegates navigation to the registered `Router` when available (via the application context).
     * Falls back to `history.pushState` for environments where no router is registered.
     *
     * @param viewModel The view model.
     * @param request The current request.
     * @param target The optional view target.
     * @protected
     */
    protected _renderView(viewModel: any, request: any, target?: ViewTarget): void {
        const targetPath: string = this._createTargetPath(viewModel, request);
        const router = this.applicationContext?.getValue(ROUTER);

        if (router?.navigate) {
            router.navigate(targetPath);
        } else if (typeof history !== 'undefined') {
            history.pushState(undefined, '', targetPath);
        }
    }
}

/**
 * Renders a simple string template into HTML by replacing {{variable}} placeholders.
 *
 * @param path The URL path for this view.
 */
export class StringTemplateView extends AbstractTemplateView {
    /**
     * The template string to render.
     *
     * Supports simple Jinja-like syntax: {{variable}}, {{array[key]}}, etc.
     */
    template!: string;

    /**
     * Creates a new StringTemplateView.
     * @param path The URL path for this view.
     */
    constructor(path: string | null = null) {
        super(path);
    }

    /**
     * Renders the template with the given template model and request.
     *
     * @param templateModel The rendered template model.
     * @param request The current request.
     * @param target The view target (required for rendering).
     */
    protected async _renderTemplate(templateModel: any, request: any, target?: ViewTarget): Promise<void> {
        if (!target) throw new IllegalStateError('View requires a ViewTarget.');

        const html = this.renderTemplate(this.template, templateModel);
        target.commit(html, templateModel, request);
    }

    /**
     * Renders the template string by replacing {{variable}} placeholders.
     *
     * Supports:
     *   - {{var}} for simple variables
     *   - {{array[key]}} for object/array access
     */
    private renderTemplate(template: string, model: any): string {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            let value = model;

            // Support nested property access: {{a.b.c}}
            const parts = key.split('.');
            for (const part of parts) {
                if (typeof value === 'object' && value !== null && typeof part !== 'number') {
                    value = value[part];
                } else if (value instanceof Array && !isNaN(part)) {
                    value = value[part];
                } else {
                    break;
                }
            }

            return String(value ?? '');
        });
    }
}
