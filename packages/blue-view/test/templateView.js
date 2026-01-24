import { expect } from 'chai';
import { RootContext } from '@blue/core';
import { TemplateView } from '@blue/view';

// import baseViewSpec from "@blue/view/test/pathBasedView";
import baseViewSpec from '../../blue-view/test/pathBasedView';

const sharedSpec = function (ViewSubType) {
    baseViewSpec(ViewSubType);

    describe('TemplateView', function () {
        test('it should be defined', function () {
            expect(ViewSubType).to.not.be.undefined;
        });

        describe('instance', function () {
            let view = undefined,
                parentContext = new RootContext('ROOT'),
                testViewId = 'templateView';

            beforeEach(function () {
                view = new ViewSubType(parentContext, {
                    name: 'testView',
                    path: 'foo/bar',
                    template: `<div id='${testViewId}'></div>`,
                });
            });

            afterEach(function () {
                return Promise.resolve(view.destroy());
            });
        });
    });
};

export default sharedSpec;
