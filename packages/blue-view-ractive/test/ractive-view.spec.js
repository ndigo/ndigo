import { expect } from 'chai';

import { RactiveView } from '../src/ractive-view';

// import templateViewSpec from "@blue/view/test/templateView";
import templateViewSpec from '../../blue-view/test/templateView';
// import webViewSpec from "@blue/view/test/webView";
import webViewSpec from '../../blue-view/test/webView';
import { RootContext } from '@blue/core';

templateViewSpec(RactiveView);
webViewSpec(RactiveView);

let testContainer = null,
    guid = 0,
    hasDOM = false;

if (document && document.querySelector) {
    testContainer = document.querySelector('body');
    hasDOM = true;
}

describe('RactiveView', function () {
    it('should be defined', function () {
        expect(RactiveView).to.not.be.undefined;
    });

    describe('instance', function () {
        let view = undefined,
            targetId = 'ractiveContainer',
            selector = `#${targetId}`,
            testViewId = 'ractiveView',
            parentContext = new RootContext('ROOT');

        beforeEach(function () {
            let target = null;
            if (hasDOM) {
                target = document.createElement('div');
                guid++;
                target.setAttribute('id', targetId);
                target.setAttribute('data-guid', `${guid}`);
                testContainer.appendChild(target);
            }
            view = new RactiveView(parentContext, {
                name: 'testView',
                path: 'foo/bar',
                template: `<div id='${testViewId}'></div>`,
            });
        });

        afterEach(function () {
            hasDOM &&
                document.getElementById(targetId) &&
                document.querySelector('body').removeChild(document.getElementById(targetId));
            return Promise.resolve(view.destroy());
        });

        describe('constructor', function () {
            it('should create a valid RactiveView', function () {
                expect(view).to.not.be.undefined;
                expect(view.name).toBe('testView');
            });

            it('should assign unique id to every view instance', function () {
                let other = new RactiveView(parentContext, {
                    name: 'other',
                    path: 'other',
                    template: {},
                });
                expect(view.id).to.not.equal(other.id);
            });
        });

        describe('isRoot', function () {
            it('should be true for a top-level view', function () {
                expect(view.isRoot()).toBe(true);
            });
        });

        if (hasDOM) {
            describe('isInDOM', function () {
                it('should be false for a view not yet rendered', function () {
                    expect(view.isInDOM()).toBe(false);
                });

                it('should be true for a view that has finished rendering', function (done) {
                    view.replaceIn(selector, {}, {}).then(
                        function () {
                            expect(view.isInDOM()).toBe(true);
                            done();
                        },
                        function () {
                            expect(true).toBe(false);
                            done();
                        }
                    );
                });

                it("should set a data- attribute including the view's id", function (done) {
                    var attrString = `${view.name}-${view.id}`;
                    view.replaceIn(selector, {}, {}).then(
                        function () {
                            expect(view.element.getAttribute('data-is-view')).toBe(attrString);
                            done();
                        },
                        function () {
                            expect(true).toBe(false);
                            done();
                        }
                    );
                });

                it("should complete 'rendered' promise when rendering is finished", function (done) {
                    view.replaceIn(selector, {}, {});

                    view.rendered.promise.then(
                        function () {
                            expect(view.isInDOM()).toBe(true);
                            done();
                        },
                        function () {
                            expect(true).toBe(false);
                            done();
                        }
                    );
                });

                describe('destroy', function () {
                    it('should remove the template from the DOM', function (done) {
                        view.replaceIn(selector, {}, {}).then(function () {
                            view.destroy().then(
                                function () {
                                    expect(document.getElementById(testViewId)).toBeNull();
                                    done();
                                },
                                function () {
                                    expect('template was NOT removed').toBe('template was removed');
                                    done();
                                }
                            );
                        });
                    });
                });

                describe('partials', function () {
                    it('should inject partials from map in view definition', function (done) {
                        let rootView = new RactiveView(parentContext, {
                            name: 'rootView',
                            path: 'root/view',
                            template: `<div id='${testViewId}'>{{>one}}</div>`,
                            spec: {},
                            partials: {
                                one: "<div id='one'></div>",
                            },
                        });
                        rootView.replaceIn(selector, {}, {});

                        rootView.rendered.promise.then(
                            function () {
                                expect(document.getElementById(testViewId)).to.not.be.null;
                                expect(document.getElementById('one')).to.not.be.null;
                                done();
                            },
                            function () {
                                expect(true).toBe(false);
                                done();
                            }
                        );
                    });
                });

                describe('subviews', function () {
                    it('should create Ractive components out of map of views', function (done) {
                        let rootView = new RactiveView(parentContext, {
                            name: 'rootView',
                            path: 'root/view',
                            template: `<div id='${testViewId}'><one/><two/></div>`,
                            spec: {},
                        });
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
                        };
                        rootView.replaceIn(selector, {}, {});

                        rootView.rendered.promise.then(
                            function () {
                                expect(document.getElementById(testViewId)).to.not.be.null;
                                expect(document.getElementById('one')).to.not.be.null;
                                expect(document.getElementById('two')).to.not.be.null;
                                done();
                            },
                            function () {
                                expect(true).toBe(false);
                                done();
                            }
                        );
                    });

                    it('should create nested Ractive components', function (done) {
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
                        });
                        rootView.replaceIn(selector, {}, {});

                        rootView.rendered.promise.then(
                            function () {
                                expect(document.getElementById(testViewId)).to.not.be.null;
                                expect(document.getElementById('one')).to.not.be.null;
                                expect(document.getElementById('two')).to.not.be.null;
                                done();
                            },
                            function () {
                                expect(true).toBe(false);
                                done();
                            }
                        );
                    });

                    it('should inject partials in subviews', function (done) {
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
                        });
                        rootView.replaceIn(selector, {}, {});

                        rootView.rendered.promise.then(
                            function () {
                                expect(document.getElementById(testViewId)).to.not.be.null;
                                expect(document.getElementById('one')).to.not.be.null;
                                expect(document.getElementById('onePart')).to.not.be.null;
                                done();
                            },
                            function () {
                                expect(true).toBe(false);
                                done();
                            }
                        );
                    });
                }); // describe subviews
            }); // describe isInDOM
        } // if hasDOM
    }); // describe instance
});
