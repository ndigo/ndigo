/**
 * @author Jeff Rose
 */

import { AbstractTemplateView, ViewTarget } from '@blue/view';
//import { BlueElement } from './blue-element';

export class WebComponentView extends AbstractTemplateView {
    tagName: string;
    template: string;

    constructor(name: string) {
        super();
        this.tagName = name;
        this.template = `<${name}>`;
    }

    protected _renderTemplate(templateModel: any, request: any): void {
        throw new Error('Method not implemented.');
    }

    protected async _renderView(viewModel: any, request: any, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new Error('WebComponentView requires a ViewTarget to render.');
        }

        if (!(this as any).applicationContext) {
            throw new Error('WebComponentView requires an ApplicationContext to resolve the ViewEngine.');
        }

        const engine = (this as any).applicationContext.getValue('webComponentViewEngine');
        if (!engine) {
            throw new Error('No WebComponentViewEngine found in ApplicationContext.');
        }

        await engine.render(this, viewModel, target, request);
    }
}
