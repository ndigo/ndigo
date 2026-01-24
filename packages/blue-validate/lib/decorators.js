import constraints from './constraints';
//import types from './types';
//import TypeValidator from './validator';
const { defineProperty, deleteProperty } = Reflect;
//validator = new TypeValidator( types );
/*
declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
*/
export const Pattern = function (params) {
    console.log('PARAMS', params);
    return function (target, propertyKey) {
        let currentValue = target[propertyKey];
        const getter = () => currentValue, setter = (newValue) => {
            console.log('PROPERTY', target, propertyKey, newValue);
            //!validator.validate( newValue, 'Pattern', params ).isValid && console.error( 'YOU BAD DATA FILE' );
            !constraints.Pattern.validate(newValue, params) && console.error('YOU BAD DATA FILE');
            currentValue = newValue;
        };
        if (deleteProperty(target, propertyKey)) {
            defineProperty(target, propertyKey, {
                get: getter,
                set: setter,
                configurable: true,
                enumerable: true,
            });
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQztBQUN4Qyw4QkFBOEI7QUFDOUIsMENBQTBDO0FBRTFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBQ25ELHlDQUF5QztBQUV6Qzs7Ozs7RUFLRTtBQUVGLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxVQUFVLE1BQU07SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUIsT0FBTyxVQUFVLE1BQWMsRUFBRSxXQUF3QjtRQUNyRCxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsWUFBWSxFQUM3QixNQUFNLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELHFHQUFxRztZQUNyRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDdEYsWUFBWSxHQUFHLFFBQVEsQ0FBQztRQUM1QixDQUFDLENBQUM7UUFFTixJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUN0QyxjQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRTtnQkFDaEMsR0FBRyxFQUFFLE1BQU07Z0JBQ1gsR0FBRyxFQUFFLE1BQU07Z0JBQ1gsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxJQUFJO2FBQ25CLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMifQ==