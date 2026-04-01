/**
 * @author Jeff Rose
 * @see core
 * @see util
 * @see {@link http://objectmodel.js.org/}
 */

import 'objectmodel/src/devtool-formatter';

/**
 * @external objectmodel
 * @see {@link http://objectmodel.js.org/}
 */

/**
 * Re-exports the ObjectModel public API used by BlueJS model helpers.
 */
export * from 'objectmodel';

/**
 * Re-exports BlueJS primitive and derived model helpers.
 */
export * from './basic';

/**
 * Re-exports BlueJS event-aware model helpers.
 */
export * from './event';
