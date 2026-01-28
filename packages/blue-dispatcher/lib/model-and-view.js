/**
 * @author Jeff Rose
 */
import { AbstractView } from '@blue/view';
/**
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
         */
        /**
         */
        /**
         */
        /**
         */
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtYW5kLXZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbW9kZWwtYW5kLXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQVEsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSWhEO0dBQ0c7QUFDSCxNQUFNLE9BQU8sWUFBWTtJQUNyQixLQUFLLENBQVE7SUFDYixRQUFRLENBQVM7SUFDakIsSUFBSSxDQUFPO0lBRVgsSUFBSSxPQUFPO1FBQ1AsT0FBTyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUM7SUFDakYsQ0FBQztJQUVELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQsWUFBWSxJQUFtQixFQUFFLFFBQWUsSUFBSTtRQUNoRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7YUFBTSxDQUFDO1lBQ0osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxJQUFJLFlBQVksWUFBWSxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM5QixDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDO1FBQ0Q7V0FDRztRQUVIO1dBQ0c7UUFFSDtXQUNHO1FBRUg7V0FDRztJQUNQLENBQUM7Q0FDSiJ9