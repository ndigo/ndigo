import { Null, createNull } from '@blue/core';
import { AsEventEmitter } from '@blue/context';
import { curryN } from '@blue/util/function';
import { forEachObjIndexed } from '@blue/util/object';
const { defineProperty, deleteProperty } = Reflect, initializeData = curryN(1, function (component, value, key) {
    component.model.set(key, value);
    defineProperty(component, key, {
        get: () => component.model.get(key, { isolate: true }),
        set: function () { },
        configurable: true,
        enumerable: true,
        writable: false,
    });
});
let uuid = 0;
/**
 */
export class GenericDomainComponent extends AsEventEmitter(Null) {
    id;
    name;
    model;
    actions;
    settings;
    states;
    destroyed;
    get [Symbol.toStringTag]() {
        return `DomainComponent:${this.name}`;
    }
    set data(newData) {
        const initData = initializeData(this);
        forEachObjIndexed(initData, newData);
        deleteProperty(this, 'data');
    }
    constructor() {
        super();
        const id = ++uuid;
        defineProperty(this, 'id', {
            get: () => id,
            configurable: true,
            enumerable: false,
        });
    }
    init(name) {
        defineProperty(this, 'name', {
            get: () => name,
            configurable: true,
            enumerable: false,
        });
    }
    validate(property) {
        throw new Error('Method not implemented.');
    }
    async destroy() {
        throw new Error('Method not implemented.');
    }
    toJSON() {
        const json = createNull();
        json.name = this.name;
        json.id = this.id;
        return json;
    }
    toString() {
        return this.name;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXlCLElBQUksRUFBZ0IsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25GLE9BQU8sRUFBRSxjQUFjLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRTdELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQTZCdEQsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlDLGNBQWMsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHO0lBQ3RELFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoQyxjQUFjLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtRQUMzQixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQ3RELEdBQUcsRUFBRSxjQUFhLENBQUM7UUFDbkIsWUFBWSxFQUFFLElBQUk7UUFDbEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsUUFBUSxFQUFFLEtBQUs7S0FDbEIsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUM7QUFFUCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFFYjtHQUNHO0FBQ0gsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGNBQWMsQ0FBQyxJQUFJLENBQUM7SUFDNUQsRUFBRSxDQUFTO0lBQ1gsSUFBSSxDQUFTO0lBQ2IsS0FBSyxDQUFhO0lBQ2xCLE9BQU8sQ0FBZ0I7SUFDdkIsUUFBUSxDQUFpQjtJQUN6QixNQUFNLENBQWU7SUFDckIsU0FBUyxDQUFVO0lBRW5CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sbUJBQW1CLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRUQsSUFBSSxJQUFJLENBQUMsT0FBbUI7UUFDeEIsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLGlCQUFpQixDQUFDLFFBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QyxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRDtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUM7UUFDbEIsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7WUFDdkIsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7WUFDYixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztTQUNwQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxDQUFDLElBQVk7UUFDYixjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUN6QixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSTtZQUNmLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1NBQ3BCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxRQUFRLENBQUMsUUFBZ0I7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTztRQUNULE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsTUFBTTtRQUNGLE1BQU0sSUFBSSxHQUFHLFVBQVUsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFbEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztDQUNKIn0=