import { FrameworkError, IllegalStateError } from '@blue/core';
import { AbstractTemplateView, ViewTarget } from '@blue/view';
//import { BlueElement } from './blue-element';

interface ApplicationContextLike {
    getValue<T = unknown>(name: string): T;
}

interface WebComponentViewEngineLike {
    render(view: WebComponentView, model: unknown, target: ViewTarget, route: unknown): Promise<void>;
}

/**
 * Template view base that delegates rendering to a web component view engine.
 */
export class WebComponentView extends AbstractTemplateView {
    /**
     * The custom element tag name rendered by this view.
     */
    tagName: string;
    /**
     * The template root used to instantiate the component markup.
     */
    template: string;
    /**
     * Application context used to resolve the web component view engine.
     */
    readonly applicationContext?: ApplicationContextLike;

    /**
     * Creates a view bound to a specific custom element tag name.
     *
     * @param name - The custom element tag name to render.
     */
    constructor(name: string) {
        super();
        this.tagName = name;
        this.template = `<${name}>`;
    }

    protected _renderTemplate(templateModel: any, request: any): void {
        throw new FrameworkError('Method not implemented.');
    }

    protected async _renderView(viewModel: any, request: any, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new IllegalStateError('WebComponentView requires a ViewTarget to render.');
        }

        if (!this.applicationContext) {
            throw new IllegalStateError('WebComponentView requires an ApplicationContext to resolve the ViewEngine.');
        }

        const engine = this.applicationContext.getValue<WebComponentViewEngineLike>('webComponentViewEngine');
        if (!engine) {
            throw new IllegalStateError('No WebComponentViewEngine found in ApplicationContext.');
        }

        await engine.render(this, viewModel, target, request);
    }
}
