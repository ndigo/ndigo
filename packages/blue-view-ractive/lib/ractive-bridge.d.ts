import { Bridge } from '@blue/view';
export declare class RactiveBridge implements Bridge {
    readonly id: number;
    readonly name: string;
    readonly spec: {
        [key: string]: any;
    };
    constructor(spec: {
        [key: string]: any;
    });
    disable(): void;
    enable(): void;
    on(): void;
}
//# sourceMappingURL=ractive-bridge.d.ts.map