/**
 * `ndigo build` — front the application's build script.
 */
import { createScriptFrontCommand } from './_script-fronts.js';

/**
 * The application build one-shot front.
 */
export const buildScriptCommand = createScriptFrontCommand(
    'build',
    'Run the application build script',
    'add a "build" script to package.json'
);
