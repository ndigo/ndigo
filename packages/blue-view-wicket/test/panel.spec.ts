import { describe, expect, it } from 'vitest';
import { Panel } from '../src/panel';
import { WicketComponent } from '../src/component';

class TestLeaf extends WicketComponent<string> {
    protected render(): void {
        // no-op
    }
}

describe('Panel', () => {
    it('sets id in constructor', () => {
        const panel = new Panel('panel');

        expect(panel.id).toBe('panel');
    });

    it('inherits container behavior for children', () => {
        const panel = new Panel('panel');
        const child = new TestLeaf('child');

        panel.addChild(child);

        expect(panel.getChild('child')).toBe(child);
    });

    it('exposes Symbol.toStringTag', () => {
        const panel = new Panel('panel');

        expect(Object.prototype.toString.call(panel)).toBe('[object Panel]');
    });
});
