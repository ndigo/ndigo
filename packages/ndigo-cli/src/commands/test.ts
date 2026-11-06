/**
 * `ndigo test` — front the application's test script.
 *
 * @since 1.0.0
 * @author Jeff Rose
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
