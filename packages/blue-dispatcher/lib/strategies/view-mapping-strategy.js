/**
 * @author Jeff Rose
 */
/**
 * @interface module:dispatcher.ViewMappingStrategy
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1tYXBwaW5nLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmF0ZWdpZXMvdmlldy1tYXBwaW5nLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBV0g7O0dBRUc7QUFFSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUM7QUFFdkMsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsQ0FDakMsVUFBYSxFQUN5QixFQUFFLENBQ3hDLEtBQU0sU0FBUSxVQUFVO0lBQ1gsY0FBYyxHQUFHLGFBQWEsQ0FBQztJQUV4QyxXQUFXLENBQUM7SUFFWixlQUFlLENBQUMsT0FBMkI7UUFDdkMsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVoQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFFOUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUNKLENBQUMifQ==