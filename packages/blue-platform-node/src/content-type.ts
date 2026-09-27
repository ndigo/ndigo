/**
 * Content-Type helpers, owned by `@blue/http` since the Wave-5 header
 * category pass (2026-09-27): this module is a compatibility hub for the
 * names the 09-25 wave published from here. New code should use the
 * `HTTPHeaders.CONTENT_TYPE` constant (`@blue/http`) directly.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
export { contentTypeBase, multipartBoundary, MULTIPART_FORM_DATA } from '@blue/http';
