/**
 * The `ndigo lint` route map: the default command fronts the application's
 * `lint` script, and `ndigo lint init` writes the recommended config.
 */
import { buildRouteMap } from '@stricli/core';
import { createJsonScriptFrontCommand } from '../_script-fronts.js';
import { initLintCommand } from './init.js';

/**
 * The default app-script front, unchanged in behavior from the pre-route-map
 * command.
 */
const lintScriptCommand = createJsonScriptFrontCommand(
    'lint',
    'Run the application lint script',
    'add a "lint" script to package.json'
);

/**
 * The `ndigo lint` route map registered under the root CLI.
 */
export const lintRouteMap = buildRouteMap({
    routes: {
        run: lintScriptCommand,
        init: initLintCommand,
    },
    defaultCommand: 'run',
    docs: { brief: 'Run the application lint script, or write the recommended config', hideRoute: { run: true } },
});
