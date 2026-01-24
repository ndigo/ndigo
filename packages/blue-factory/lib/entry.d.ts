/**
 * @author Jeff Rose
 */
export default class Entry<T> {
    #private;
    get name(): string;
    get scope(): string;
    get value(): T;
    constructor(name: string, value: T, scope: string);
}
//# sourceMappingURL=entry.d.ts.map