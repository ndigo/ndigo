/**
 * @param {import('typedoc').Application} app
 */
module.exports = function load(app) {
    app.converter.on(app.converter.constructor.EVENT_CREATE_DECLARATION, (context, reflection) => {
        const { symbol } = reflection;
        if (!symbol) {
            return;
        }

        const jsDocTags = symbol.getJsDocTags();
        const sigTag = jsDocTags.find((tag) => tag.name === 'sig');

        if (sigTag && sigTag.text) {
            const comment = context.getComment(symbol);
            if (comment) {
                comment.blockTags.push({
                    tag: '@signature',
                    content: [{ kind: 'code', text: sigTag.text.trim().replace(/[\r\n]/g, '') }],
                });
            }
        }
    });
};
