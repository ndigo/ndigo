/**
 * @author Jeff Rose
 */

const stache = /\{\{([^\}]+)\}\}/g, //mustache-like

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
        replacements: string | any[] | { [key: string]: any },
        syntax: RegExp = stache
    ): string => {
        const replacer = (match: string, value: string) => {
            // Simple nested property access
            let obj: any = replacements;
            const keys = value.split('.');
            for (const key of keys) {
                if (obj == null) return '';
                obj = obj[key];
            }
            return obj ?? '';
        };
        return (template ?? '').replace(syntax, replacer);
    };

export default interpolate;