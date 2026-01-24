import { Null, createNull } from '@blue/core';
import { AsEventEmitter } from '@blue/context';
import { forEachObjIndexed, curryN } from '@blue/util';
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
 * @class module:component.GenericDomainComponent
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXlCLElBQUksRUFBZ0IsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25GLE9BQU8sRUFBRSxjQUFjLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRTdELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUE2QnZELE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QyxjQUFjLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxVQUFVLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRztJQUN0RCxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDaEMsY0FBYyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFDM0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUN0RCxHQUFHLEVBQUUsY0FBYSxDQUFDO1FBQ25CLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRVAsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBRWI7O0dBRUc7QUFDSCxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsY0FBYyxDQUFDLElBQUksQ0FBQztJQUM1RCxFQUFFLENBQVM7SUFDWCxJQUFJLENBQVM7SUFDYixLQUFLLENBQWE7SUFDbEIsT0FBTyxDQUFnQjtJQUN2QixRQUFRLENBQWlCO0lBQ3pCLE1BQU0sQ0FBZTtJQUNyQixTQUFTLENBQVU7SUFFbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxtQkFBbUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxPQUFtQjtRQUN4QixNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztRQUNsQixjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN2QixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtZQUNiLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1NBQ3BCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxJQUFJLENBQUMsSUFBWTtRQUNiLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ3pCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJO1lBQ2YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7U0FDcEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFFBQVEsQ0FBQyxRQUFnQjtRQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPO1FBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxNQUFNO1FBQ0YsTUFBTSxJQUFJLEdBQUcsVUFBVSxFQUFFLENBQUM7UUFFMUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUVsQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0NBQ0oifQ==