/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
/**
 * @function module:dispatcher.ViewMapping
 * @param {external:string} viewName
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.ViewMapping(2)
 */
export declare const ViewMapping: ((viewName: string) => ClassDecorator) & {
    /**
     * @function module:dispatcher.ViewMapping.define
     * @param {*} value
     * @param {*} target
     */
    define: (value: any, target: any) => void;
    /**
     * @function module:dispatcher.ViewMapping.delete
     * @param {*} target
     */
    delete: (target: any) => boolean;
    /**
     * @function module:dispatcher.ViewMapping.get
     * @param {*} target
     * @returns {external:string}
     */
    get: (target: any) => string;
    /**
     * @function module:dispatcher.ViewMapping.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` has a view mapping.
     */
    has: (target: any) => boolean;
};
//# sourceMappingURL=view-mapping.d.ts.map