/**
 * @author Jeff Rose
 */
import { MediaTypes } from '@blue/core';
export class AbstractLayout {
    mediaType;
    constructor() {
        this.mediaType = MediaTypes.TEXT_PLAIN;
    }
}
export class AbstractBatchLayout extends AbstractLayout {
    batchFooter;
    batchHeader;
    batchSeparator;
    constructor() {
        super();
        this.batchFooter = '';
        this.batchHeader = '';
        this.batchSeparator = '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGF5b3V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFhLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQWdCbkQsTUFBTSxPQUFnQixjQUFjO0lBQ2hDLFNBQVMsQ0FBWTtJQUVyQjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztJQUMzQyxDQUFDO0NBR0o7QUFFRCxNQUFNLE9BQWdCLG1CQUFvQixTQUFRLGNBQWM7SUFDNUQsV0FBVyxDQUFTO0lBQ3BCLFdBQVcsQ0FBUztJQUNwQixjQUFjLENBQVM7SUFFdkI7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FHSiJ9