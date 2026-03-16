/**
 * @author Jeff Rose
 */

import { MethodParameter } from '@blue/dispatcher';
import { Route } from '@blue/router';

export interface ArgumentValueConversionContext {
    name: string;
    parameter: MethodParameter;
    route: Route;
    mapping: any;
}

export type ArgumentValueConverter = (value: any, context: ArgumentValueConversionContext) => any;

export const identityArgumentValueConverter: ArgumentValueConverter = (value) => value;
