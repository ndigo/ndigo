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
    return function (target: Object, propertyKey: PropertyKey): void {
        let currentValue = target[propertyKey];
        const getter = () => currentValue,
            setter = (newValue) => {
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
