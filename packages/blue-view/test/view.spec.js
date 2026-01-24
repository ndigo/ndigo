import { expect } from 'chai';
import { View } from '../src/view';
import { MediaType } from '@blue/core';

describe('View Interface', function () {
    class TestView {
        destroy() {
            throw new Error('Method not implemented.');
        }
        trigger(name, data) {
            throw new Error('Method not implemented.');
        }
        onData(name, handler, options) {
            throw new Error('Method not implemented.');
        }
        onInit() {
            throw new Error('Method not implemented.');
        }
        onDestroy() {
            throw new Error('Method not implemented.');
        }
    }
    it('should be defined', function () {
        expect(TestView).to.not.be.undefined;
    });
});
