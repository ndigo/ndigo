//import * as Ractive from 'ractive';
let uid = 0;
export class RactiveBridge {
    id;
    name;
    spec;
    constructor(spec) {
        this.name = spec.name || 'ANONYMOUS BRIDGE';
        this.id = uid++;
        this.spec = spec;
    }
    disable() {
        throw new Error('Method not implemented.');
    }
    enable() {
        throw new Error('Method not implemented.');
    }
    on() {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFjdGl2ZS1icmlkZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmFjdGl2ZS1icmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EscUNBQXFDO0FBRXJDLElBQUksR0FBRyxHQUFXLENBQUMsQ0FBQztBQUVwQixNQUFNLE9BQU8sYUFBYTtJQUNiLEVBQUUsQ0FBUztJQUNYLElBQUksQ0FBUztJQUNiLElBQUksQ0FBeUI7SUFFdEMsWUFBWSxJQUE0QjtRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksa0JBQWtCLENBQUM7UUFDNUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQsT0FBTztRQUNILE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsTUFBTTtRQUNGLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsRUFBRTtRQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0oifQ==