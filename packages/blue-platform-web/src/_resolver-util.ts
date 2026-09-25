/**
 * @module blue-platform-web
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
