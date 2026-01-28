/**
 * @author Jeff Rose
 */
import { AbstractAppender } from '../appender';
export class AlertAppender extends AbstractAppender {
    append(entry) {
        alert(this.layout.format(entry));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQtYXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBwZW5kZXJzL2FsZXJ0LWFwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRy9DLE1BQU0sT0FBTyxhQUFjLFNBQVEsZ0JBQWdCO0lBQy9DLE1BQU0sQ0FBQyxLQUFZO1FBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckMsQ0FBQztDQUNKIn0=