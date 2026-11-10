/**
 * `ndigo typecheck` — front the application's typecheck script.
 */
import { createJsonScriptFrontCommand } from './_script-fronts.js';

/**
 * The application typecheck front.
 */
export const typecheckCommand = createJsonScriptFrontCommand(
    'typecheck',
    'Run the application typecheck script',
    'add a "typecheck" script to package.json'
);
