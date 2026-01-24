import { describe, it, expect } from 'vitest';

describe('View Interface', () => {
    class TestView {
        destroy() {
            throw new Error('Method not implemented.');
        }
        trigger(name: string, data?: any) {
            throw new Error('Method not implemented.');
        }
        onData(name: string, handler: Function, options?: any) {
            throw new Error('Method not implemented.');
        }
        onInit() {
            throw new Error('Method not implemented.');
        }
        onDestroy() {
            throw new Error('Method not implemented.');
        }
    }
    it('should be defined', () => {
        expect(TestView).toBeDefined();
    });
});
