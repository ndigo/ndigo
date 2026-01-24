/**
 * @author Jeff Rose
 */
import { Null, GlobPathMatcher } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { AsApplicationContextAware } from '@blue/context';
/**
 * @interface module:view.ViewMapping
 */
/**
 * @function module:view.ViewMapping#getTarget
 * @param {module:router.Route} route
 */
const { defineProperty } = Reflect;
export class AbstractViewMapping extends AsNameAware(AsApplicationContextAware(Null)) {
    applicationContext;
    defaultTarget;
    interceptors;
    pathMatcher;
    get [Symbol.toStringTag]() {
        return 'ViewMapping';
    }
    constructor() {
        super();
        defineProperty(this, 'defaultTarget', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'interceptors', {
            value: [],
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'pathMatcher', {
            value: new GlobPathMatcher(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    getTarget(route) {
        let target = this._getTarget(route);
        if (!target) {
            target = this.defaultTarget;
        }
        if (!target) {
            return null;
        }
    }
}
export class AbstractPathViewMapping extends AbstractViewMapping {
    rootTarget;
    useTrailingSlashMatch;
    _targets;
    constructor() {
        super();
        this.rootTarget = null;
        this.useTrailingSlashMatch = false;
        defineProperty(this, '_targets', {
            value: new Map(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1tYXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ZpZXctbWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQWUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFzQix5QkFBeUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU85RTs7R0FFRztBQUVIOzs7R0FHRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkMsTUFBTSxPQUFnQixtQkFBb0IsU0FBUSxXQUFXLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUYsa0JBQWtCLENBQXFCO0lBQ3ZDLGFBQWEsQ0FBTTtJQUNuQixZQUFZLENBQVE7SUFDcEIsV0FBVyxDQUFjO0lBRXpCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFRDtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsY0FBYyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDbEMsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNqQyxLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxJQUFJLGVBQWUsRUFBRTtZQUM1QixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQVk7UUFDbEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVwQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDVixNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1YsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztJQUNMLENBQUM7Q0FHSjtBQUVELE1BQU0sT0FBZ0IsdUJBQXdCLFNBQVEsbUJBQW1CO0lBQ3JFLFVBQVUsQ0FBQztJQUNYLHFCQUFxQixDQUFVO0lBRVosUUFBUSxDQUFtQjtJQUU5QztRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztRQUVuQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM3QixLQUFLLEVBQUUsSUFBSSxHQUFHLEVBQXdCO1lBQ3RDLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSiJ9