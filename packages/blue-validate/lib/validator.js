/**
 * @author Jeff Rose
 */
import Type from './type';
const defineProperty = Reflect.defineProperty;
/*
export class ConstraintValidator implements Validator {
    readonly constraints: Map<string, Constraint>;

    constructor( constraints: ValidationConstraints ){
        defineProperty( this, 'constraints', {
            value: new Map<string, Constraint>(),
            configurable: true,
            enumerable: false,
            writable: false
        } );
        this.register( constraints );
    }

    register( constraints ){
        for( const name in constraints ){
            this.constraints.set( name, constraints[ name ] );
        }
    }

    validate( value: serializable, name: string, params: Params ): ValidationResults {
        this.constraints.
    }

}
*/
export default class TypeValidator {
    types;
    constructor(types) {
        defineProperty(this, 'types', {
            value: new Map(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.register(types);
    }
    register(types) {
        for (const name in types) {
            this.types.set(name, new Type(name, types[name]));
        }
    }
    availableTypes() {
        return Array.from(this.types.keys());
    }
    hasType(name) {
        return this.types.has(name);
    }
    validate(value, name, params) {
        // Is the type defined?
        if (!this.hasType(name)) {
            throw new TypeError(`Type "${name}" does not exist`);
        }
        const // Get the type
        type = this.types.get(name), 
        // Get the results of validation
        results = type.validate(value, params);
        return results;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUNILE9BQU8sSUFBMkIsTUFBTSxRQUFRLENBQUM7QUFJakQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztBQU05Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXlCRTtBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sYUFBYTtJQUNyQixLQUFLLENBQW9CO0lBRWxDLFlBQVksS0FBSztRQUNiLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzFCLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBZ0I7WUFDOUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsUUFBUSxDQUFDLEtBQUs7UUFDVixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO0lBQ0wsQ0FBQztJQUVELGNBQWM7UUFDVixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBWTtRQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBbUIsRUFBRSxJQUFZLEVBQUUsTUFBTTtRQUM5Qyx1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN0QixNQUFNLElBQUksU0FBUyxDQUFDLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxNQUFNLGVBQWU7UUFDakIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUMzQixnQ0FBZ0M7UUFDaEMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTNDLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FDSiJ9