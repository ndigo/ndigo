import { Bridge } from '@blue/view';
//import * as Ractive from 'ractive';

let uid: number = 0;

export class RactiveBridge implements Bridge {
    readonly id: number;
    readonly name: string;
    readonly spec: { [key: string]: any };

    constructor(spec: { [key: string]: any }) {
        this.name = spec.name || 'ANONYMOUS BRIDGE';
        this.id = uid++;
        this.spec = spec;
    }

    disable(): void {
        throw new Error('Method not implemented.');
    }
    enable(): void {
        throw new Error('Method not implemented.');
    }
    on(): void {
        throw new Error('Method not implemented.');
    }
}
