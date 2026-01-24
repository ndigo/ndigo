/**
 * @author Jeff Rose
 */
import { AbstractView } from '@blue/view';
/**
 * @class module:dispatcher.ModelAndView
 */
export class ModelAndView {
    model;
    viewName;
    view;
    get hasView() {
        return typeof this.viewName === 'string' || typeof this.view !== 'undefined';
    }
    get [Symbol.toStringTag]() {
        return `ModelAndView:${this.viewName}`;
    }
    constructor(view, model = null) {
        if (typeof view === 'string') {
            this.viewName = view;
            this.view = null;
        }
        else {
            this.view = view;
            if (view instanceof AbstractView) {
                this.viewName = view.name;
            }
        }
        if (model) {
            this.model = model;
        }
        /**
         * @member {external:boolean} module:dispatcher.ModelAndView#hasView
         */
        /**
         * @member {*} module:dispatcher.ModelAndView#model
         */
        /**
         * @member {external:string} module:dispatcher.ModelAndView#viewName
         */
        /**
         * @member {module:view.View} module:dispatcher.ModelAndView#view
         */
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtYW5kLXZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbW9kZWwtYW5kLXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQVEsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSWhEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFlBQVk7SUFDckIsS0FBSyxDQUFRO0lBQ2IsUUFBUSxDQUFTO0lBQ2pCLElBQUksQ0FBTztJQUVYLElBQUksT0FBTztRQUNQLE9BQU8sT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLGdCQUFnQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELFlBQVksSUFBbUIsRUFBRSxRQUFlLElBQUk7UUFDaEQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLElBQUksSUFBSSxZQUFZLFlBQVksRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDOUIsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUNEOztXQUVHO1FBRUg7O1dBRUc7UUFFSDs7V0FFRztRQUVIOztXQUVHO0lBQ1AsQ0FBQztDQUNKIn0=