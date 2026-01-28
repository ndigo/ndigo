/**
 * @author Jeff Rose
 */
import { GenericApplicationContext, StandardEnvironment, } from '@blue/context';
import { IllegalStateError } from '@blue/core';
/**
 * Class that can be used to bootstrap and launch an application.
 * @param {string} name The name of the application
 */
export class Application {
    #environemnt;
    #name;
    #properties;
    #sources;
    get sources() {
        return this.#sources;
    }
    constructor(sources) {
        this.#sources = new Set(sources);
    }
    /**
     * Run the Spring application, creating and refreshing a new {@link ApplicationContext|ApplicationContext}.
     * @param {*} args
     */
    run(...args) {
        let context;
        try {
            const environment = this._prepareEnvironment(args);
            context = this._prepareContext(environment, args);
        }
        catch (e) {
            throw new IllegalStateError();
        }
        return context;
    }
    setEnvironment(environment) {
        this.#environemnt = environment;
    }
    setName(name) {
        this.#name = name;
    }
    setProfiles(...profiles) {
        profiles;
    }
    setProperties(properties) {
        this.#properties = properties;
    }
    /**
     * @protected
     * @param {module:context.Environment} environment
     * @param {Array<external:string>} args
     */
    _configureEnvironment(environment, args) {
        this._configurePropertySources(environment, args);
        this._configureProfiles(environment, args);
    }
    /**
     * @protected
     * @param {module:context.Environment} environment
     * @param {Array<external:string>} args
     */
    _configureProfiles(environment, args) { }
    _configurePropertySources(environment, args) {
        if (this.#properties) {
            environment.propertySources.push(this.#properties);
        }
    }
    _prepareContext(environment, args) {
        const context = new GenericApplicationContext();
        context.setEnvironment(environment);
        return context;
    }
    _prepareEnvironment(args) {
        const env = this._getOrCreateEnvironment();
        this._configureEnvironment(env, args);
        return env;
    }
    _getOrCreateEnvironment() {
        return this.#environemnt ? this.#environemnt : new StandardEnvironment();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwbGljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBSUgseUJBQXlCLEVBQ3pCLG1CQUFtQixHQUN0QixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsaUJBQWlCLEVBQWMsTUFBTSxZQUFZLENBQUM7QUFFM0Q7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFdBQVc7SUFDcEIsWUFBWSxDQUEwQjtJQUN0QyxLQUFLLENBQVM7SUFDZCxXQUFXLENBQWE7SUFDeEIsUUFBUSxDQUFnQjtJQUV4QixJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELFlBQVksT0FBbUI7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBVyxPQUFPLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsR0FBRyxDQUFDLEdBQUcsSUFBYztRQUNqQixJQUFJLE9BQU8sQ0FBQztRQUVaLElBQUksQ0FBQztZQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxNQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUNsQyxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVELGNBQWMsQ0FBQyxXQUFvQztRQUMvQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUNwQyxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQVk7UUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxHQUFHLFFBQWtCO1FBQzdCLFFBQVEsQ0FBQztJQUNiLENBQUM7SUFFRCxhQUFhLENBQUMsVUFBc0I7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxxQkFBcUIsQ0FBQyxXQUFvQyxFQUFFLElBQWM7UUFDaEYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7OztPQUlHO0lBQ08sa0JBQWtCLENBQUMsV0FBb0MsRUFBRSxJQUFjLElBQVMsQ0FBQztJQUVqRix5QkFBeUIsQ0FBQyxXQUFvQyxFQUFFLElBQWM7UUFDcEYsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7SUFDTCxDQUFDO0lBRVMsZUFBZSxDQUFDLFdBQW9DLEVBQUUsSUFBYztRQUMxRSxNQUFNLE9BQU8sR0FBRyxJQUFJLHlCQUF5QixFQUFFLENBQUM7UUFDaEQsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwQyxPQUFPLE9BQXdDLENBQUM7SUFDcEQsQ0FBQztJQUVTLG1CQUFtQixDQUFDLElBQWM7UUFDeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTyx1QkFBdUI7UUFDM0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLG1CQUFtQixFQUFFLENBQUM7SUFDN0UsQ0FBQztDQUNKIn0=