/**
 * @author Jeff Rose
 */
const defineProperty = Reflect.defineProperty;
// export interface Bridge {
//     id: number;
//     name: string;
//     disable(): void;
//     enable(): void;
//     on(): void;
// }
export class Bridge {
    spec;
    name;
    constructor(spec) {
        defineProperty(this, 'spec', {
            value: spec,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.name = spec.name || 'ANONYMOUS BRIDGE';
    }
    disable() {
        // not yet implemented
    }
    enable() {
        throw new Error('Method not implemented.');
    }
    on() {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2JyaWRnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFFOUMsNEJBQTRCO0FBQzVCLGtCQUFrQjtBQUNsQixvQkFBb0I7QUFFcEIsdUJBQXVCO0FBQ3ZCLHNCQUFzQjtBQUN0QixrQkFBa0I7QUFDbEIsSUFBSTtBQUVKLE1BQU0sT0FBTyxNQUFNO0lBQ04sSUFBSSxDQUF5QjtJQUN0QyxJQUFJLENBQVM7SUFFYixZQUFZLElBQTRCO1FBQ3BDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ3pCLEtBQUssRUFBRSxJQUFJO1lBQ1gsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLGtCQUFrQixDQUFDO0lBQ2hELENBQUM7SUFFRCxPQUFPO1FBQ0gsc0JBQXNCO0lBQzFCLENBQUM7SUFDRCxNQUFNO1FBQ0YsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxFQUFFO1FBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSiJ9