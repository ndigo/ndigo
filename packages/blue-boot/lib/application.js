/**
 * @author Jeff Rose
 */
import { GenericApplicationContext, StandardEnvironment, } from '@blue/context';
import { IllegalStateError } from '@blue/core';
/**
 * Class that can be used to bootstrap and launch an application.
 * @class module:boot.Application
 * @param {external:string} name The name of the application
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
     * Run the Spring application, creating and refreshing a new {@linkcode module:context.ApplicationContext|ApplicationContext}.
     * @function module:boot.Application#run
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
     * @function module:boot.Application#_configureEnvironment
     * @param {module:context.Environment} environment
     * @param {external:Array<external:string>} args
     */
    _configureEnvironment(environment, args) {
        this._configurePropertySources(environment, args);
        this._configureProfiles(environment, args);
    }
    /**
     * @protected
     * @function module:boot.Application#_configureProfiles
     * @param {module:context.Environment} environment
     * @param {external:Array<external:string>} args
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwbGljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBSUgseUJBQXlCLEVBQ3pCLG1CQUFtQixHQUN0QixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsaUJBQWlCLEVBQWMsTUFBTSxZQUFZLENBQUM7QUFFM0Q7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBQ3BCLFlBQVksQ0FBMEI7SUFDdEMsS0FBSyxDQUFTO0lBQ2QsV0FBVyxDQUFhO0lBQ3hCLFFBQVEsQ0FBZ0I7SUFFeEIsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxZQUFZLE9BQW1CO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQVcsT0FBTyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxHQUFHLENBQUMsR0FBRyxJQUFjO1FBQ2pCLElBQUksT0FBTyxDQUFDO1FBRVosSUFBSSxDQUFDO1lBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULE1BQU0sSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsY0FBYyxDQUFDLFdBQW9DO1FBQy9DLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBWTtRQUNoQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQsV0FBVyxDQUFDLEdBQUcsUUFBa0I7UUFDN0IsUUFBUSxDQUFDO0lBQ2IsQ0FBQztJQUVELGFBQWEsQ0FBQyxVQUFzQjtRQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDTyxxQkFBcUIsQ0FBQyxXQUFvQyxFQUFFLElBQWM7UUFDaEYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNPLGtCQUFrQixDQUFDLFdBQW9DLEVBQUUsSUFBYyxJQUFTLENBQUM7SUFFakYseUJBQXlCLENBQUMsV0FBb0MsRUFBRSxJQUFjO1FBQ3BGLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2RCxDQUFDO0lBQ0wsQ0FBQztJQUVTLGVBQWUsQ0FBQyxXQUFvQyxFQUFFLElBQWM7UUFDMUUsTUFBTSxPQUFPLEdBQUcsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEMsT0FBTyxPQUF3QyxDQUFDO0lBQ3BELENBQUM7SUFFUyxtQkFBbUIsQ0FBQyxJQUFjO1FBQ3hDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRU8sdUJBQXVCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0lBQzdFLENBQUM7Q0FDSiJ9