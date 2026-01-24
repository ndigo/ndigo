/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
/**
 * @function module:dispatcher.TagMapping
 * @param {external:string} tagName
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.TagMapping(2)
 */
export declare const TagMapping: ((tagName: string) => ClassDecorator) & {
    /**
     * @function module:dispatcher.TagMapping.define
     * @param {*} value
     * @param {*} target
     */
    define: (value: any, target: any) => void;
    /**
     * @function module:dispatcher.TagMapping.delete
     * @param {*} target
     */
    delete: (target: any) => boolean;
    /**
     * @function module:dispatcher.TagMapping.get
     * @param {*} target
     * @returns {external:string}
     */
    get: (target: any) => string;
    /**
     * @function module:dispatcher.TagMapping.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` has a tag mapping.
     */
    has: (target: any) => boolean;
};
//# sourceMappingURL=tag-mapping.d.ts.map