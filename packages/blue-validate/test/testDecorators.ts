import { Pattern } from '../src/decorators';

export class Test {
    @Pattern( { regex: /foo/ } )
    foo: string;

    bar: string;

    constructor( arg1: string, arg2: string ){
        this.test( arg1, arg2 );
    }

    test( arg1: string, arg2: string ){
        this.foo = arg1;
        this.bar = arg2;
    }
}
