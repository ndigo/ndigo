/**
 * `ndigo format` — front the application's format script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createScriptFrontCommand } from './_script-fronts.js';

export const formatCommand = createScriptFrontCommand(
    'format',
    'Run the application format script',
    'add a "format" script to package.json'
);
