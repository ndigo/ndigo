/**
 * @author Jeff Rose
 */

import { AbstractTemplateView } from '@blue/view';
//import { BlueElement } from './blue-element';

export class WebComponentView extends AbstractTemplateView {
    template: string;

    constructor(name: string) {
        super();
        this.template = `<${name}>`;
    }

    protected _renderTemplate(templateModel: any, request: any): void {
        throw new Error('Method not implemented.');
    }

    protected _renderView(viewModel: any, request: any): void {
        throw new Error('Method not implemented.');
    }
}
