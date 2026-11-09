/**
 * Code block glue.
 *
 * Copies the `<code>` text through the Clipboard API (with a legacy
 * `execCommand` fallback), updates the copy button, and emits `nd-copy`.
 */

/** Payload of `nd-copy`. */
export interface CodeBlockCopyDetail {
    readonly text: string;
}

/** Handle returned by {@link initCodeBlocks}. */
export interface CodeBlockHandle {
    readonly root: HTMLElement;
    copy(): Promise<boolean>;
    destroy(): void;
}

const COPY_RESET_MS = 1500;

/**
 * Wires every code block under `root`.
 * @param root - Document or container holding `[data-code-block]` blocks.
 * @returns One handle per block (empty when the markup is absent).
 */
export function initCodeBlocks(root: ParentNode): CodeBlockHandle[] {
    return [...root.querySelectorAll<HTMLElement>('[data-code-block]')].map((block) => initCodeBlock(block));
}

function initCodeBlock(block: HTMLElement): CodeBlockHandle {
    const code = block.querySelector<HTMLElement>('code');
    const button = block.querySelector<HTMLButtonElement>('[data-copy]');
    const doc = block.ownerDocument;
    const controller = new AbortController();
    const label = button?.textContent?.trim() || 'Copy';
    if (button !== null) button.textContent = label;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const copy = async (): Promise<boolean> => {
        const text = code?.textContent ?? '';
        if (text.length === 0) return false;
        const copied = await writeClipboard(doc, text);
        if (!copied) return false;

        block.dispatchEvent(
            new CustomEvent<CodeBlockCopyDetail>('nd-copy', {
                detail: { text },
                bubbles: true,
                composed: true,
            })
        );

        if (button !== null) {
            button.textContent = 'Copied';
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                button.textContent = label;
            }, COPY_RESET_MS);
        }
        return true;
    };

    button?.addEventListener('click', () => void copy(), { signal: controller.signal });

    return {
        root: block,
        copy,
        destroy(): void {
            controller.abort();
            clearTimeout(resetTimer);
        },
    };
}

async function writeClipboard(doc: Document, text: string): Promise<boolean> {
    const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
    if (clipboard?.writeText) {
        try {
            await clipboard.writeText(text);
            return true;
        } catch {
            // Fall through to the legacy path when the API rejects (permissions).
        }
    }

    const area = doc.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    doc.body.append(area);
    area.select();
    try {
        return typeof doc.execCommand === 'function' && doc.execCommand('copy');
    } catch {
        return false;
    } finally {
        area.remove();
    }
}
