import { describe, expect, test } from 'vitest';
import { Site } from '../src/site';
import { SiteBuilder } from '../src/site-builder';
import { Application } from '../src/application';
import { Router } from '@blue/router';

const createRouter = (): Router =>
    ({
        route: '/',
        callback: () => null,
    }) as Router;

describe('Site', () => {
    test('it should keep router and applications', () => {
        const router = createRouter();
        const app = new Application([]);
        const site = new Site(router, [app]);

        expect(site.router).toBe(router);
        expect(site.applications).toEqual([app]);
    });

    test('it should add applications', () => {
        const site = new Site(createRouter(), []);
        const app = new Application([]);

        const returned = site.addApplication(app);

        expect(returned).toBe(site);
        expect(site.applications).toContain(app);
    });
});

describe('SiteBuilder', () => {
    test('it should build a site with router and applications', () => {
        const router = createRouter();
        const app = new Application([]);
        const site = new SiteBuilder(router).application(app).build();

        expect(site.router).toBe(router);
        expect(site.applications).toEqual([app]);
    });

    test('it should support applications variadic helper', () => {
        const appA = new Application([]);
        const appB = new Application([]);
        const site = new SiteBuilder(createRouter()).applications(appA, appB).build();

        expect(site.applications).toEqual([appA, appB]);
    });

    test('it should allow late router assignment', () => {
        const router = createRouter();
        const site = new SiteBuilder().router(router).build();

        expect(site.router).toBe(router);
        expect(site.applications).toEqual([]);
    });
});
