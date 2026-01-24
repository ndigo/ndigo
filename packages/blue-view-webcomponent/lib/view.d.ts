/**
 * @author Jeff Rose
 */
import { AbstractTemplateView } from '@blue/view';
export declare class WebComponentView extends AbstractTemplateView {
    template: string;
    constructor(name: string);
    protected _renderTemplate(templateModel: any, request: any): void;
    protected _renderView(viewModel: any, request: any): void;
}
//# sourceMappingURL=view.d.ts.map