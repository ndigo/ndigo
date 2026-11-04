/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { isString } from '@ndigo/util/types';
import { ContextToken, isContextToken } from '@ndigo/factory';
import type { ApplicationContext } from '@ndigo/context';

const { toString } = Object.prototype;

const doesNotStartWithSlash = (value: string) => !value.startsWith('/');

const kind = /^\[object (.+)\]$/;
const kindOf = (value: unknown): string | undefined => kind.exec(toString.call(value))?.[1];

type Maybe<T> = string | T;

/**
 * A handler reference: a live object, a bean-name string (deserialized mapping
 * tables), or a {@link ContextToken} (typed programmatic mappings — AD-34 D1).
 */
type MaybeHandler = Maybe<object> | ContextToken<object>;

const resolveHandlerWithContext =
    (context: ApplicationContext) =>
    (handler: MaybeHandler): object | undefined =>
        isContextToken(handler)
            ? context.getValue<object>(handler)
            : isString(handler)
              ? context.getValue(handler as string)
              : (handler as object);

export { doesNotStartWithSlash, kindOf, resolveHandlerWithContext };
export type { Maybe, MaybeHandler };
