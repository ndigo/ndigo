/**
 * `ndigo test` — front the application's test script.
 */
import { createScriptFrontCommand } from './_script-fronts.js';

/**
 * The application test front.
 */
export const testCommand = createScriptFrontCommand(
    'test',
    'Run the application test script',
    'add a "test" script to package.json'
);
