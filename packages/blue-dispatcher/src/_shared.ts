import { isString } from '@blue/util/types';
import type { ApplicationContext } from '@blue/context';

const { toString } = Object.prototype;

const doesNotStartWithSlash = (value: string) => !value.startsWith('/');

const kind = /^\[object (.+)\]$/;
const kindOf = (value: any): string | undefined => kind.exec(toString.call(value))?.[1];

type Maybe<T> = string | T;
type MaybeHandler = Maybe<object>;

const resolveHandlerWithContext =
    (context: ApplicationContext) =>
    (handler: MaybeHandler): object | undefined =>
        isString(handler) ? context.getValue(handler as string) : (handler as object);

export { doesNotStartWithSlash, kindOf, resolveHandlerWithContext };
export type { Maybe, MaybeHandler };
