/**
 * @author Jeff Rose
 */
import { View } from '@blue/view';
type Model<T = any> = {
    [key: string]: T;
} | Map<string, T>;
/**
 * @class module:dispatcher.ModelAndView
 */
export declare class ModelAndView {
    model: Model;
    viewName: string;
    view: View;
    get hasView(): boolean;
    get [Symbol.toStringTag](): string;
    constructor(view: View | string, model?: Model);
}
export {};
//# sourceMappingURL=model-and-view.d.ts.map