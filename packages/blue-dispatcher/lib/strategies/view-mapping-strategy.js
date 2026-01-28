/**
 * @author Jeff Rose
 */
/**
 */
export const defaultViewMapping = null;
export const AsViewMappingStrategy = (superclass) => class extends superclass {
    viewMappingKey = 'viewMapping';
    viewMapping;
    initViewMapping(context) {
        const { viewMappingKey } = this;
        this.initStrategy(context, viewMappingKey, 'viewMapping', defaultViewMapping);
        console.log('Dispatcher::initViewMapping', this.viewMapping);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1tYXBwaW5nLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmF0ZWdpZXMvdmlldy1tYXBwaW5nLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBV0g7R0FDRztBQUVILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQztBQUV2QyxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxDQUNqQyxVQUFhLEVBQ3lCLEVBQUUsQ0FDeEMsS0FBTSxTQUFRLFVBQVU7SUFDWCxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBRXhDLFdBQVcsQ0FBQztJQUVaLGVBQWUsQ0FBQyxPQUEyQjtRQUN2QyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWhDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUU5RSxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRSxDQUFDO0NBQ0osQ0FBQyJ9