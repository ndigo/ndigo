/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
/**
 * @param {string} viewName
 * @returns {Function}
 */
/**
 */
export declare const ViewMapping: ((viewName: string) => ClassDecorator) & {
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
     * @returns {boolean} Whether or not the `target` has a view mapping.
     */
    has: (target: any) => boolean;
};
//# sourceMappingURL=view-mapping.d.ts.map