/**
 * `ndigo format` — front the application's format script.
 */
import { createScriptFrontCommand } from './_script-fronts.js';

/**
 * The application format front.
 */
export const formatCommand = createScriptFrontCommand(
    'format',
    'Run the application format script',
    'add a "format" script to package.json'
);
