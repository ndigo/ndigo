/**
 * `ndigo lint` — front the application's lint script.
 */
import { createJsonScriptFrontCommand } from './_script-fronts.js';

/**
 * The application lint front.
 */
export const lintCommand = createJsonScriptFrontCommand(
    'lint',
    'Run the application lint script',
    'add a "lint" script to package.json'
);
