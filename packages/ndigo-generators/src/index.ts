/**
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Public entry point for the Ndigo Nx generator set.
 *
 * Nx discovers the generators through `generators.json`; this module makes
 * them importable as a library API as well (e.g. for programmatic use in
 * other tooling).
 */
import appGenerator from './generators/app/generator.js';
import componentGenerator from './generators/component/generator.js';
import headerGenerator from './generators/header/generator.js';
import packageGenerator from './generators/package/generator.js';
import readmeGenerator from './generators/readme/generator.js';

export { appGenerator, componentGenerator, headerGenerator, packageGenerator, readmeGenerator };
export {
    buildDocHeader,
    getTopDocBlock,
    type DocHeaderOptions,
    type HeaderGeneratorSchema,
} from './generators/header/generator.js';
export { type AppGeneratorSchema, type AppKind } from './generators/app/generator.js';
export { type ComponentGeneratorSchema } from './generators/component/generator.js';
export { type PackageGeneratorSchema } from './generators/package/generator.js';
export { type ReadmeGeneratorSchema } from './generators/readme/generator.js';
