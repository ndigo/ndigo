/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
export {
    argumentValueConverters,
    convertArgumentValue,
    createOptionalConverter,
    createStringSplitConverter,
    identityArgumentValueConverter,
    resolveConverter,
    toBooleanValue,
    toDateValue,
    toJSONStringValue,
    toNumberValue,
} from '@blue/dispatcher';
export type {
    ArgumentValueConversionContext,
    ArgumentValueConverter,
    ArgumentValueConverterRegistry,
    ConverterResolutionOptions,
    ResolverConverterOption,
} from '@blue/dispatcher';

/**
 * Passes a resolved value through unchanged. Used by resolvers whose values are
 * already final (e.g. uploaded file parts), so the shared required/default-value
 * handling still runs without any type conversion.
 */
export function passthroughArgumentValue(
    _convertType: { source: unknown; target: unknown } | undefined,
    value: unknown
): unknown {
    return value;
}
