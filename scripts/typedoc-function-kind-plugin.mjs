/**
 * TypeDoc plugin: document function-valued variables as functions.
 *
 * TypeDoc converts `export const f = (value) => ...` to a Function only when
 * the initializer is a function literal and the declaration carries no type
 * annotation (`shouldAutomaticallyConvertAsFunction`). Factory-produced
 * callables therefore stay Variables and render under "Variables" with a
 * `const` signature: duck-type guards such as
 * `export const likeContentSource = like({...}) as (value) => value is ContentSource`,
 * decorator factories (`getMapping = verbDecorator('GET', ...)`), and
 * cross-package re-export stubs.
 *
 * This plugin reclassifies those reflections as Functions after conversion.
 * Callable objects with members (`TagMapping`, `errorHandler`, ...) keep their
 * member documentation and stay Variables. The `@function` modifier tag would
 * do the same per symbol, but STYLE_GUIDE §5 keeps source docs on the TSDoc
 * standard, which defines no such tag.
 *
 * Depends on TypeDoc's reflection internals: the reclassification runs on
 * `createDeclaration`, which TypeDoc fires from `finalizeDeclarationReflection`
 * after `convertVariable` has assigned the reflection type. A TypeDoc upgrade
 * that changes this ordering would leave the pages as Variables again, which
 * the committed-`api/` freshness diff surfaces immediately.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @param {import('typedoc').Application} app */
export function load(app) {
    const { ReflectionFlag, ReflectionKind } = require('typedoc');
    app.converter.on('createDeclaration', (context, reflection) => {
        if (reflection.kind !== ReflectionKind.Variable) return;
        if (reflection.type?.type !== 'reflection') return;
        const declaration = reflection.type.declaration;
        if (declaration?.kind !== ReflectionKind.TypeLiteral) return;
        if (!declaration.signatures?.length) return;

        // Member-bearing callables (`Object.assign(fn, {...})`) document their
        // properties; keep them as Variables so those members stay visible.
        const symbol = context.getSymbolFromReflection(reflection);
        const location = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
        const type = symbol && location ? context.checker.getTypeOfSymbolAtLocation(symbol, location) : undefined;
        if (!type || type.getProperties().length) return;
        if (!type.getCallSignatures().length || type.getConstructSignatures().length) return;

        reflection.kind = ReflectionKind.Function;
        reflection.signatures = declaration.signatures;
        for (const signature of reflection.signatures) {
            signature.parent = reflection;
            signature.name = reflection.name;
        }
        reflection.type = undefined;
        reflection.setFlag(ReflectionFlag.Const, false);
        // Match `convertVariableAsFunction`: a single signature inherits the
        // symbol comment when it has none of its own.
        if (reflection.signatures.length === 1 && !reflection.signatures[0].comment && reflection.comment) {
            reflection.signatures[0].comment = reflection.comment;
            delete reflection.comment;
        }
    });
}
