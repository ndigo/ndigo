import { describe, expect, test } from 'vitest';
import { Route } from '@blue/router';
import AccountController from '../src/account-controller';

describe('AccountController', () => {
    const route = { path: '/account' } as Route;

    test('handleIndex returns account overview model', () => {
        const controller = new AccountController();
        const mv = controller.handleIndex(route);

        expect((mv.model as any).section).toBe('overview');
        expect((mv.model as any).title).toBe('Account Overview');
    });

    test('handleSettings returns account settings model', () => {
        const controller = new AccountController();
        const mv = controller.handleSettings(route);

        expect((mv.model as any).section).toBe('settings');
        expect((mv.model as any).title).toBe('Account Settings');
    });
});
