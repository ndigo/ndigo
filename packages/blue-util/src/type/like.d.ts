/**
 * @author Jeff Rose
 * @author opencode (performance optimization)
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
export type LikeDescriptor = {
    [key: string]: Function | true;
};
declare function like(descriptor: LikeDescriptor, value: any): boolean;
declare function like(descriptor: LikeDescriptor): (value: any) => boolean;
export default like;
