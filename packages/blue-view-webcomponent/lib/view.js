/**
 * @author Jeff Rose
 */
import { AbstractTemplateView } from '@blue/view';
//import { BlueElement } from './blue-element';
export class WebComponentView extends AbstractTemplateView {
    template;
    constructor(name) {
        super();
        this.template = `<${name}>`;
    }
    _renderTemplate(templateModel, request) {
        throw new Error('Method not implemented.');
    }
    _renderView(viewModel, request) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xELCtDQUErQztBQUUvQyxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsb0JBQW9CO0lBQ3RELFFBQVEsQ0FBUztJQUVqQixZQUFZLElBQVk7UUFDcEIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksSUFBSSxHQUFHLENBQUM7SUFDaEMsQ0FBQztJQUVTLGVBQWUsQ0FBQyxhQUFrQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFUyxXQUFXLENBQUMsU0FBYyxFQUFFLE9BQVk7UUFDOUMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSiJ9