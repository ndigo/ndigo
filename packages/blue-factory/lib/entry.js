/**
 * @author Jeff Rose
 */
export default class Entry {
    #name;
    #scope;
    #value;
    get name() {
        return this.#name;
    }
    get scope() {
        return this.#scope;
    }
    get value() {
        return this.#value;
    }
    constructor(name, value, scope) {
        this.#name = name;
        this.#value = value;
        this.#scope = scope;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW50cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxNQUFNLENBQUMsT0FBTyxPQUFPLEtBQUs7SUFDdEIsS0FBSyxDQUFTO0lBQ2QsTUFBTSxDQUFTO0lBQ2YsTUFBTSxDQUFJO0lBRVYsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsWUFBWSxJQUFZLEVBQUUsS0FBUSxFQUFFLEtBQWE7UUFDN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDeEIsQ0FBQztDQUNKIn0=