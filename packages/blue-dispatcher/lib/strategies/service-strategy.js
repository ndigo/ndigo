/**
 * @author Jeff Rose
 */
const { defineProperty } = Reflect, SERVICE_CALL = 'serviceCall', SERVICE_CALLS = `${SERVICE_CALL}s`, SERVICE_INTERCEPTOR = 'serviceInterceptor', SERVICE_INTERCEPTORS = `${SERVICE_INTERCEPTOR}s`, defaultServiceInterceptors = [];
export const AsServiceStrategy = (superclass) => class extends superclass {
    serviceCallKey;
    serviceCallCollectionKey;
    serviceInterceptorKey;
    serviceInterceptorCollectionKey;
    serviceCalls;
    serviceInterceptors;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'serviceCallKey', {
            get: () => SERVICE_CALL,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'serviceCallCollectionKey', {
            get: () => SERVICE_CALLS,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'serviceInterceptorKey', {
            get: () => SERVICE_INTERCEPTOR,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'serviceInterceptorCollectionKey', {
            get: () => SERVICE_INTERCEPTORS,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(SERVICE_INTERCEPTORS);
    }
    initServiceStrategy(context) {
        const { serviceCallKey, serviceCallCollectionKey: serivceCallCollectionKey, serviceInterceptorKey, serviceInterceptorCollectionKey: serivceInterceptorCollectionKey, } = this;
        this.initCollectionStrategy(context, serivceCallCollectionKey, serviceCallKey, SERVICE_CALLS, defaultServiceInterceptors);
        this.initCollectionStrategy(context, serivceInterceptorCollectionKey, serviceInterceptorKey, SERVICE_INTERCEPTORS, defaultServiceInterceptors);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJhdGVnaWVzL3NlcnZpY2Utc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFZSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixZQUFZLEdBQUcsYUFBYSxFQUM1QixhQUFhLEdBQUcsR0FBRyxZQUFZLEdBQUcsRUFDbEMsbUJBQW1CLEdBQUcsb0JBQW9CLEVBQzFDLG9CQUFvQixHQUFHLEdBQUcsbUJBQW1CLEdBQUcsRUFDaEQsMEJBQTBCLEdBQUcsRUFBRSxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQzdCLFVBQWEsRUFDcUIsRUFBRSxDQUNwQyxLQUFNLFNBQVEsVUFBVTtJQUNYLGNBQWMsQ0FBUztJQUN2Qix3QkFBd0IsQ0FBUztJQUNqQyxxQkFBcUIsQ0FBUztJQUM5QiwrQkFBK0IsQ0FBUztJQUVqRCxZQUFZLENBQU07SUFDbEIsbUJBQW1CLENBQUM7SUFFcEIsWUFBWSxHQUFHLElBQVc7UUFDdEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDZixjQUFjLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ25DLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxZQUFZO1lBQ3ZCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsMEJBQTBCLEVBQUU7WUFDN0MsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWE7WUFDeEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUMxQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CO1lBQzlCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsaUNBQWlDLEVBQUU7WUFDcEQsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLG9CQUFvQjtZQUMvQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELG1CQUFtQixDQUFDLE9BQTJCO1FBQzNDLE1BQU0sRUFDRixjQUFjLEVBQ2Qsd0JBQXdCLEVBQUUsd0JBQXdCLEVBQ2xELHFCQUFxQixFQUNyQiwrQkFBK0IsRUFBRSwrQkFBK0IsR0FDbkUsR0FBRyxJQUFJLENBQUM7UUFDVCxJQUFJLENBQUMsc0JBQXNCLENBQ3ZCLE9BQU8sRUFDUCx3QkFBd0IsRUFDeEIsY0FBYyxFQUNkLGFBQWEsRUFDYiwwQkFBMEIsQ0FDN0IsQ0FBQztRQUNGLElBQUksQ0FBQyxzQkFBc0IsQ0FDdkIsT0FBTyxFQUNQLCtCQUErQixFQUMvQixxQkFBcUIsRUFDckIsb0JBQW9CLEVBQ3BCLDBCQUEwQixDQUM3QixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUMifQ==