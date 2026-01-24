import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RactiveView } from '../src/ractive-view';
import templateViewSpec from '../../blue-view/test/templateView';
import webViewSpec from '../../blue-view/test/webView';
import { RootContext } from '@blue/core';

templateViewSpec(RactiveView);
webViewSpec(RactiveView);

let testContainer: HTMLElement | null = null;
let guid = 0;
let hasDOM = false;

if (document && document.querySelector) {
    testContainer = document.querySelector('body');
    hasDOM = true;
}

describe('RactiveView', () => {
    it('should be defined', () => {
        expect(RactiveView).toBeDefined();
    });

    describe('instance', () => {
        let view: RactiveView | undefined = undefined;
        const targetId = 'ractiveContainer';
        const selector = `#${targetId}`;
        const testViewId = 'ractiveView';
        const parentContext = new RootContext('ROOT');

        beforeEach(() => {
            let target: HTMLElement | null = null;
            if (hasDOM) {
                target = document.createElement('div');
                guid++;
                target.setAttribute('id', targetId);
                target.setAttribute('data-guid', `${guid}`);
                testContainer!.appendChild(target);
            }
            view = new RactiveView(parentContext, {
                name: 'testView',
                path: 'foo/bar',
                template: `<div id='${testViewId}'></div>`,
            } as any);
        });

        afterEach(() => {
            hasDOM &&
                document.getElementById(targetId) &&
                document.querySelector('body')!.removeChild(document.getElementById(targetId)!);
            return Promise.resolve(view!.destroy());
        });

        describe('constructor', () => {
            it('should create a valid RactiveView', () => {
                expect(view).toBeDefined();
                expect(view!.name).toBe('testView');
            });

            it('should assign unique id to every view instance', () => {
                let other = new RactiveView(parentContext, {
                    name: 'other',
                    path: 'other',
                    template: {},
                } as any);
                expect(view!.id).not.toBe(other.id);
            });
        });

        describe('isRoot', () => {
            it('should be true for a top-level view', () => {
                expect(view!.isRoot()).toBe(true);
            });
        });

        if (hasDOM) {
            describe('isInDOM', () => {
                it('should be false for a view not yet rendered', () => {
                    expect(view!.isInDOM()).toBe(false);
                });

                it('should be true for a view that has finished rendering', async () => {
                    await view!.replaceIn(selector, {}, {});
                    expect(view!.isInDOM()).toBe(true);
                });

                it("should set a data- attribute including the view's id", async () => {
                    const attrString = `${view!.name}-${view!.id}`;
                    await view!.replaceIn(selector, {}, {});
                    expect(view!.element.getAttribute('data-is-view')).toBe(attrString);
                });

                it("should complete 'rendered' promise when rendering is finished", async () => {
                    view!.replaceIn(selector, {}, {});
                    await view!.rendered.promise;
                    expect(view!.isInDOM()).toBe(true);
                });

                describe('destroy', () => {
                    it('should remove the template from the DOM', async () => {
                        await view!.replaceIn(selector, {}, {});
                        await view!.destroy();
                        expect(document.getElementById(testViewId)).toBeNull();
                    });
                });

                describe('partials', () => {
                    it('should inject partials from map in view definition', async () => {
                        let rootView = new RactiveView(parentContext, {
                            name: 'rootView',
                            path: 'root/view',
                            template: `<div id='${testViewId}'>{{>one}}</div>`,
                            spec: {},
                            partials: {
                                one: "<div id='one'></div>",
                            },
                        } as any);
                        rootView.replaceIn(selector, {}, {});

                        await rootView.rendered.promise;
                        expect(document.getElementById(testViewId)).not.toBeNull();
                        expect(document.getElementById('one')).not.toBeNull();
                    });
                });

                describe('subviews', () => {
                    it('should create Ractive components out of map of views', async () => {
                        let rootView = new RactiveView(parentContext, {
                            name: 'rootView',
                            path: 'root/view',
                            template: `<div id='${testViewId}'><one/><two/></div>`,
                            spec: {},
                        } as any);
                        rootView.views = {
                            one: {
                                name: 'one',
                                path: 'one',
                                template: "<div id='one'></div>",
                                spec: {},
                            },
                            two: {
                                name: 'two',
                                path: 'two',
                                template: "<div id='two'></div>",
                                spec: {},
                            },
                        } as any;
                        rootView.replaceIn(selector, {}, {});

                        await rootView.rendered.promise;
                        expect(document.getElementById(testViewId)).not.toBeNull();
                        expect(document.getElementById('one')).not.toBeNull();
                        expect(document.getElementById('two')).not.toBeNull();
                    });

                    it('should create nested Ractive components', async () => {
                        let rootView = new RactiveView(parentContext, {
                            name: 'rootView',
                            path: 'root/view',
                            template: `<div id='${testViewId}'><one/></div>`,
                            spec: {},
                            views: {
                                one: {
                                    name: 'one',
                                    path: 'one',
                                    template: "<div id='one'><two/></div>",
                                    spec: {},
                                    views: {
                                        two: {
                                            name: 'two',
                                            path: 'two',
                                            template: "<div id='two'></div>",
                                            spec: {},
                                        },
                                    },
                                },
                            },
                        } as any);
                        rootView.replaceIn(selector, {}, {});

                        await rootView.rendered.promise;
                        expect(document.getElementById(testViewId)).not.toBeNull();
                        expect(document.getElementById('one')).not.toBeNull();
                        expect(document.getElementById('two')).not.toBeNull();
                    });

                    it('should inject partials in subviews', async () => {
                        let rootView = new RactiveView(parentContext, {
                            name: 'rootView',
                            path: 'root/view',
                            template: `<div id='${testViewId}'><one/></div>`,
                            spec: {},
                            views: {
                                one: {
                                    name: 'one',
                                    path: 'one',
                                    template: "<div id='one'>{{>one}}</div>",
                                    spec: {},
                                    partials: {
                                        one: "<div id='onePart'></div>",
                                    },
                                },
                            },
                        } as any);
                        rootView.replaceIn(selector, {}, {});

                        await rootView.rendered.promise;
                        expect(document.getElementById(testViewId)).not.toBeNull();
                        expect(document.getElementById('one')).not.toBeNull();
                        expect(document.getElementById('onePart')).not.toBeNull();
                    });
                });
            });
        }
    });
});
