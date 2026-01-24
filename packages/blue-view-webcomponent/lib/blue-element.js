/**
 * @author Jeff Rose
 */
const NAME = 'name';
export const AsBlueElement = (superclass) => class extends superclass {
    get name() {
        return this.getAttribute(NAME);
    }
    set name(newName) {
        newName && this.setAttribute(NAME, newName);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmx1ZS1lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2JsdWUtZWxlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQVFILE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUVwQixNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsQ0FBdUMsVUFBYSxFQUFrQyxFQUFFLENBQ2pILEtBQU0sU0FBUSxVQUFVO0lBQ3BCLElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsSUFBSSxJQUFJLENBQUMsT0FBZTtRQUNwQixPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNKLENBQUMifQ==