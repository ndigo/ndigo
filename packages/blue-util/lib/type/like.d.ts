/**
 * @author Jeff Rose
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @see {@link https://ramdajs.com/docs/}
 */
export type LikeDescriptor = {
    [key: string]: Function | true;
};
type LikeFunction = {
    (descriptor: LikeDescriptor, value: any): boolean;
    (descriptor: LikeDescriptor): (value: any) => boolean;
};
declare const likeCurried: LikeFunction;
export default likeCurried;
//# sourceMappingURL=like.d.ts.map