/**
 * Structural guard for the {@link View} contract.
 * @module ndigo-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { isFunction } from '@ndigo/util/types';
import { View } from './view.js';

/**
 * Tests whether a value behaves like a {@link View}: an object exposing a
 * `render` function and a `mediaType`.
 *
 * @param value - The value to inspect.
 * @returns `true` when the value is View-shaped.
 */
export const likeView = (value: unknown): value is View =>
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    isFunction((value as View).render) &&
    'mediaType' in value;
