/**
 * @author Jeff Rose
 */
import { Null, GlobPathMatcher } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { AsApplicationContextAware } from '@blue/context';
/**
 */
/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1tYXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ZpZXctbWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQWUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFzQix5QkFBeUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU85RTtHQUNHO0FBRUg7O0dBRUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DLE1BQU0sT0FBZ0IsbUJBQW9CLFNBQVEsV0FBVyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFGLGtCQUFrQixDQUFxQjtJQUN2QyxhQUFhLENBQU07SUFDbkIsWUFBWSxDQUFRO0lBQ3BCLFdBQVcsQ0FBYztJQUV6QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQ7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLGNBQWMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ2xDLEtBQUssRUFBRSxJQUFJO1lBQ1gsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDakMsS0FBSyxFQUFFLEVBQUU7WUFDVCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNoQyxLQUFLLEVBQUUsSUFBSSxlQUFlLEVBQUU7WUFDNUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFZO1FBQ2xCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1YsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNWLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0NBR0o7QUFFRCxNQUFNLE9BQWdCLHVCQUF3QixTQUFRLG1CQUFtQjtJQUNyRSxVQUFVLENBQUM7SUFDWCxxQkFBcUIsQ0FBVTtJQUVaLFFBQVEsQ0FBbUI7SUFFOUM7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFFbkMsY0FBYyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDN0IsS0FBSyxFQUFFLElBQUksR0FBRyxFQUF3QjtZQUN0QyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0oifQ==