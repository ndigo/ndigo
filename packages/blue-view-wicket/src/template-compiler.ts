/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';

/**
 * A single binding slot in a compiled template, representing a DOM
 * element tagged with a `data-w-id` attribute.
 */
export interface BindingSlot {
    /** The `data-w-id` attribute value (matches a component id). */
    readonly id: string;
    /** The DOM element that the component will render into. */
    readonly element: Element;
}

/**
 * The result of compiling an HTML template. Contains the parsed DOM
 * tree and a map of binding slots keyed by `data-w-id`.
 */
export interface CompiledTemplate {
    /** The root element of the compiled template. */
    readonly root: DocumentFragment;
    /** Binding slots keyed by `data-w-id` value. */
    readonly slots: Map<string, BindingSlot>;
}

/**
 * Attribute name used in templates to mark elements that should be
 * bound to Wicket components.
 */
const DATA_W_ID = 'data-w-id';

/**
 * Attribute name used to mark fragment regions in templates.
 */
const DATA_W_FRAGMENT = 'data-w-fragment';

/**
 * Compiles HTML templates into binding-slot maps by scanning for
 * `data-w-id` attributes.
 *
 * The compiler uses a {@link DOMProvider} for isomorphic DOM parsing.
 */
export class TemplateCompiler {
    #dom: DOMProvider;

    get [Symbol.toStringTag](): string {
        return 'TemplateCompiler';
    }

    /**
     * Creates a new template compiler.
     *
     * @param dom - The DOM provider to use for parsing HTML.
     */
    constructor(dom: DOMProvider) {
        this.#dom = dom;
    }

    /**
     * Compiles an HTML string into a {@link CompiledTemplate}.
     *
     * Parses the HTML, scans for all elements with `data-w-id` attributes,
     * and returns the root fragment along with a map of binding slots.
     *
     * @param html - The HTML template string to compile.
     * @returns The compiled template with root element and binding slots.
     */
    compile(html: string): CompiledTemplate {
        const doc = this.#dom.parseHTML(html);
        const root = this.#dom.createFragment();
        const body = doc.body ?? doc.documentElement;

        // Move all child nodes into the fragment
        while (body.firstChild) {
            root.appendChild(body.firstChild);
        }

        const slots = new Map<string, BindingSlot>();
        this.#scanSlots(root, slots);

        return { root, slots };
    }

    /**
     * Recursively scans a DOM subtree for elements with `data-w-id` attributes.
     */
    #scanSlots(node: Node, slots: Map<string, BindingSlot>): void {
        if (node.nodeType === 1 /* ELEMENT_NODE */) {
            const element = node as Element;
            const wicketId = element.getAttribute(DATA_W_ID);
            if (wicketId) {
                slots.set(wicketId, { id: wicketId, element });
            }
        }

        let child = node.firstChild;
        while (child) {
            this.#scanSlots(child, slots);
            child = child.nextSibling;
        }
    }
}

export { DATA_W_ID, DATA_W_FRAGMENT };
