/**
 * `ndigo build` — front the application's build script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createScriptFrontCommand } from './_script-fronts.js';

export const buildScriptCommand = createScriptFrontCommand(
    'build',
    'Run the application build script',
    'add a "build" script to package.json'
);
