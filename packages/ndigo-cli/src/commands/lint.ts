/**
 * `ndigo lint` — front the application's lint script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createScriptFrontCommand } from './_script-fronts.js';

/**
 * The application lint front.
 */
export const lintCommand = createScriptFrontCommand(
    'lint',
    'Run the application lint script',
    'add a "lint" script to package.json'
);
