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
    readonly spec: { [ key: string ]: any };
    name: string;

    constructor( spec: { [ key: string ]: any } ) {
        defineProperty( this, 'spec', {
            value: spec,
            configurable: true,
            enumerable: false,
            writable: false
        } );

        this.name = spec.name || "ANONYMOUS BRIDGE";
    }

    disable(): void {
        // not yet implemented
    }
    enable(): void {
        throw new Error( "Method not implemented." );
    }
    on(): void {
        throw new Error( "Method not implemented." );
    }
}
