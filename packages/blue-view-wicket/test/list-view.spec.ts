import { describe, expect, it, vi } from 'vitest';
import type { DOMProvider } from '@blue/dom';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import { ListItem } from '../src/list-item';
import { ListView } from '../src/list-view';
import { WicketComponent } from '../src/component';

class TestLeaf extends WicketComponent<string> {
    protected render(dom: DOMProvider, container: Element | DocumentFragment): void {
        const element = dom.createElement('span');
        element.textContent = this.model.get() ?? '';
        container.appendChild(element);
    }
}

class TestListView extends ListView<string> {
    populateItemSpy = vi.fn();

    protected populateItem(item: ListItem<string>): void {
        this.populateItemSpy(item);
        const value = item.model.get();
        item.addChild(new TestLeaf('leaf', new StaticModel(value ?? '')));
    }
}

describe('ListItem', () => {
    it('exposes Symbol.toStringTag', () => {
        const item = new ListItem('item', 0);

        expect(Object.prototype.toString.call(item)).toBe('[object ListItem]');
    });

    it('stores index from constructor', () => {
        const item = new ListItem('item', 4);

        expect(item.index).toBe(4);
    });

    it('stores model from constructor', () => {
        const model = new StaticModel('value');
        const item = new ListItem('item', 0, model);

        expect(item.model).toBe(model);
    });
});

describe('ListView', () => {
    it('exposes Symbol.toStringTag', () => {
        const listView = new TestListView('list');

        expect(Object.prototype.toString.call(listView)).toBe('[object ListView]');
    });

    it('creates ListItem children during renderComponent', () => {
        const dom = new LinkedomDOMProvider();
        const listView = new TestListView('list', new StaticModel(['a', 'b', 'c']));
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);

        expect(listView.children.size).toBe(3);
        expect(listView.getChild('0')).toBeInstanceOf(ListItem);
        expect(listView.getChild('1')).toBeInstanceOf(ListItem);
        expect(listView.getChild('2')).toBeInstanceOf(ListItem);
    });

    it('assigns correct index and model to each ListItem', () => {
        const dom = new LinkedomDOMProvider();
        const values = ['alpha', 'beta'];
        const listView = new TestListView('list', new StaticModel(values));
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);

        values.forEach((value, index) => {
            const item = listView.getChild(String(index)) as ListItem<string>;
            expect(item.index).toBe(index);
            expect(item.model).toBeInstanceOf(StaticModel);
            expect(item.model.get()).toBe(value);
        });
    });

    it('calls populateItem for each item', () => {
        const dom = new LinkedomDOMProvider();
        const values = ['first', 'second', 'third'];
        const listView = new TestListView('list', new StaticModel(values));
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);

        expect(listView.populateItemSpy).toHaveBeenCalledTimes(values.length);
        expect(listView.populateItemSpy.mock.calls.map((call) => call[0].index)).toEqual([0, 1, 2]);
    });

    it('handles empty array model', () => {
        const dom = new LinkedomDOMProvider();
        const listView = new TestListView('list', new StaticModel([]));
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);

        expect(listView.children.size).toBe(0);
        expect(listView.populateItemSpy).not.toHaveBeenCalled();
    });

    it('treats undefined model as empty array', () => {
        const dom = new LinkedomDOMProvider();
        const listView = new TestListView('list');
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);

        expect(listView.children.size).toBe(0);
        expect(listView.populateItemSpy).not.toHaveBeenCalled();
    });

    it('treats null model value as empty array', () => {
        const dom = new LinkedomDOMProvider();
        const listView = new TestListView('list', new StaticModel(null as unknown as string[]));
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);

        expect(listView.children.size).toBe(0);
        expect(listView.populateItemSpy).not.toHaveBeenCalled();
    });

    it('clears old children on re-render', () => {
        const dom = new LinkedomDOMProvider();
        const listView = new TestListView('list', new StaticModel(['one', 'two']));
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);
        const originalItem = listView.getChild('0') as ListItem<string>;

        listView.model = new StaticModel(['next']);
        listView.renderComponent(dom, host);

        expect(listView.children.size).toBe(1);
        expect(listView.getChild('1')).toBeNull();
        expect(listView.getChild('0')).not.toBe(originalItem);
        expect(originalItem.parent).toBeNull();
    });

    it('renders ListItem children into the container', () => {
        const dom = new LinkedomDOMProvider();
        const listView = new TestListView('list', new StaticModel(['first', 'second']));
        const host = dom.createElement('div');

        listView.renderComponent(dom, host);

        const spans = Array.from(host.querySelectorAll('span'));
        expect(spans).toHaveLength(2);
        expect(spans.map((span) => span.textContent)).toEqual(['first', 'second']);
    });
});
