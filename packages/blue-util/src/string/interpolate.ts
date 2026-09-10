const stache = /\{\{([^}]+)\}\}/g, //mustache-like
    /**
     * String interpolation. Format/replace tokens with object properties.
     * @param {string} template
     * @param {Object} replacements
     * @param {string} [syntax]
     * @returns {string}
     * @example
     * let tmpl;
     *
     * tmpl = 'Hello {{name}}!';
     * interpolate( tmpl, { name: 'World' } );       // "Hello World!"
     * interpolate( tmpl, { name: 'Lorem Ipsum' } ); // "Hello Lorem Ipsum!"
     *
     * tmpl = 'Hello {{name.first}}!';
     * interpolate( tmpl, { name: { first: 'Lorem' } } ); // "Hello Lorem!"
     */
    interpolate = (
        template: string,
        replacements: string | unknown[] | { [key: string]: unknown },
        syntax: RegExp = stache
    ): string => {
        const replacer = (match: string, value: string) => {
            // Simple nested property access
            let obj: unknown = replacements;
            const keys = value.split('.');
            for (const key of keys) {
                if (obj == null) return '';
                if (typeof obj === 'string') {
                    // Strings are boxed indexable containers; keep original bracket lookup behavior
                    obj = (obj as unknown as Record<string, unknown>)[key];
                } else if (typeof obj === 'object' || typeof obj === 'function') {
                    const record = obj as Record<string, unknown>;
                    obj = record[key];
                } else {
                    // Primitives other than strings expose no own properties
                    return '';
                }
            }
            return typeof obj === 'string' ? obj : String(obj ?? '');
        };
        return (template ?? '').replace(syntax, replacer);
    };

export default interpolate;
