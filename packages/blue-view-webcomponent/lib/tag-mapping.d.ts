/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
/**
 * @param {string} tagName
 * @returns {Function}
 */
/**
 */
export declare const TagMapping: ((tagName: string) => ClassDecorator) & {
    /**
     * @param {*} value
     * @param {*} target
     */
    define: (value: any, target: any) => void;
    /**
     * @param {*} target
     */
    delete: (target: any) => boolean;
    /**
     * @param {*} target
     * @returns {string}
     */
    get: (target: any) => string;
    /**
     * @param {*} target
     * @returns {boolean} Whether or not the `target` has a tag mapping.
     */
    has: (target: any) => boolean;
};
//# sourceMappingURL=tag-mapping.d.ts.map