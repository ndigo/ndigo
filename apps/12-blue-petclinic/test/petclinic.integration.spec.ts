/**
 * Integration suite for the PetClinic app.
 *
 * Boots the real `PetClinicConfiguration` (the configuration `src/index.ts`
 * uses) and drives it through `@blue/test`'s `MockHTTP`, so every assertion
 * below runs the whole pipeline: argument binding, the Zod form contracts,
 * handler execution, EJS view resolution through the real template files, and
 * the response contract. Nothing is stubbed and nothing is asserted against a
 * fixture — the markup comes out of the same `views/*.ejs` files the server
 * serves.
 *
 * The suite is deliberately ordered: the read-only groups (pages, search,
 * validation re-renders and the JSON representations) run first, and the
 * groups that create or update rows run last, so no count asserted earlier can
 * be invalidated by a later write.
 *
 * @module blue-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootApp, MockHTTP, type BlueTestApp } from '@blue/test';
import { MESSAGE_SOURCE } from '../src/context-tokens';
import { PetClinicConfiguration } from '../src/petclinic-configuration';

const FORM = { 'content-type': 'application/x-www-form-urlencoded' };

describe('blue-petclinic', () => {
    let app: BlueTestApp;
    let http: MockHTTP;

    beforeAll(() => {
        app = bootApp([PetClinicConfiguration]);
        // Same wiring as the app bootstrap: the templates resolve messages
        // through the context's message source.
        app.context.setMessageSource(app.context.getValue(MESSAGE_SOURCE));
        http = new MockHTTP(app);
    });

    afterAll(() => {
        app.close();
    });

    describe('welcome page', () => {
        test('GET / renders the welcome page with the section links and the seeded counts', async () => {
            const res = await http.get('/').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<title>Welcome to Blue PetClinic · Blue PetClinic</title>');
            expect(html).toContain('<h1>Welcome to Blue PetClinic</h1>');
            expect(html).toContain('12 owners and 6 veterinarians are registered.');
            expect(html).toContain('href="/owners"');
            expect(html).toContain('href="/owners/new"');
            expect(html).toContain('href="/vets"');
            // The two static assets come from public/ (see the static test below).
            expect(html).toContain('href="/static/petclinic.css"');
            expect(html).toContain('src="/static/logo.svg"');
        });

        test('GET / negotiates the page language from Accept-Language', async () => {
            const res = await http.get('/').headers({ 'accept-language': 'fr' }).exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('lang="fr');
            expect(html).toContain('Bienvenue sur Blue PetClinic');
            expect(html).toContain('12 propriétaires et 6 vétérinaires sont enregistrés.');
        });

        test('GET /static/petclinic.css serves the stylesheet with its content type', async () => {
            const res = await http.get('/static/petclinic.css').exec();

            expect(res.response.status).toBe(200);
            expect(String(res.response.headers['content-type'])).toContain('text/css');
            expect(res.text()).toContain('--brand:');
        });
    });

    describe('owner search and pagination', () => {
        test('GET /owners lists five owners of the twelve, sorted by name', async () => {
            const res = await http.get('/owners').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('Black, Jeff');
            expect(html).toContain('Coleman, Jean');
            expect(html).toContain('Davis, Harold');
            expect(html).toContain('Page 1 of 3');
            expect(html).toContain('12 matching owners');
            expect(html).toContain('href="/owners?lastName=&amp;page=2"');
            expect(html).not.toContain('Eduardo');
        });

        test('GET /owners?page=3 shows the last page and a working previous link', async () => {
            const res = await http.get('/owners').query({ page: '3' }).exec();

            const html = res.text();
            expect(html).toContain('Rodriquez, Eduardo');
            expect(html).toContain('Schroeder, David');
            expect(html).toContain('Page 3 of 3');
            expect(html).toContain('href="/owners?lastName=&amp;page=2"');
            expect(html).not.toContain('page=4');
        });

        test('GET /owners?lastName=Davis filters on the last-name prefix', async () => {
            const res = await http.get('/owners').query({ lastName: 'Davis' }).exec();

            const html = res.text();
            expect(html).toContain('Davis, Betty');
            expect(html).toContain('Davis, Bonnie');
            expect(html).toContain('Davis, Harold');
            expect(html).toContain('3 matching owners');
            expect(html).toContain('Page 1 of 1');
            expect(html).toContain('value="Davis"');
        });

        test('a lower-case search matches too (the prefix match is case-insensitive)', async () => {
            const res = await http.get('/owners').query({ lastName: 'mc' }).exec();

            expect(res.text()).toContain('McTavish, Peter');
        });

        test('an unknown last name renders the empty result, not an error', async () => {
            const res = await http.get('/owners').query({ lastName: 'Zzz' }).exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('No owners found for');
            expect(html).toContain('Zzz');
            expect(html).not.toContain('<table class="table">');
        });

        test('a page past the last one is served as the last page', async () => {
            const res = await http.get('/owners').query({ lastName: 'Davis', page: '9' }).exec();

            const html = res.text();
            expect(html).toContain('Davis, Harold');
            expect(html).toContain('Page 1 of 1');
            expect(html).not.toContain('No owners found for');
        });

        test('GET /owners/:id renders the owner, its pets and each pet’s visits', async () => {
            const res = await http.get('/owners/6').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<h1>Jean Coleman</h1>');
            expect(html).toContain('105 N. Lake St.');
            expect(html).toContain('Monona');
            expect(html).toContain('6085552654');
            expect(html).toContain('Samantha');
            expect(html).toContain('Max');
            expect(html).toContain('Sep 4, 1995');
            expect(html).toContain('rabies shot');
            expect(html).toContain('neutered');
            expect(html).toContain('spayed');
            expect(html).toContain('href="/owners/6/edit"');
            expect(html).toContain('href="/owners/6/pets/new"');
            expect(html).toContain('href="/owners/6/pets/7/visits/new"');
        });

        test('GET /owners/:id answers 404 for an unknown, or non-numeric, id', async () => {
            const unknown = await http.get('/owners/999').exec();
            expect(unknown.response.status).toBe(404);
            expect(unknown.text()).toContain('<h1>Not found</h1>');
            expect(unknown.text()).toContain('No owner with id 999 exists.');

            const malformed = await http.get('/owners/abc').exec();
            expect(malformed.response.status).toBe(404);
            expect(malformed.text()).toContain('No owner with id abc exists.');
        });
    });

    describe('owner create form', () => {
        test('GET /owners/new renders the empty create form', async () => {
            const res = await http.get('/owners/new').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<h1>New owner</h1>');
            expect(html).toContain('method="post" action="/owners/new"');
            for (const field of ['firstName', 'lastName', 'address', 'city', 'telephone']) {
                expect(html).toContain(`name="${field}"`);
            }
            expect(html).toContain('<button type="submit">Add owner</button>');
        });

        test('a failed POST re-renders the form with the entered values and per-field messages', async () => {
            const res = await http
                .post('/owners/new')
                .body({ firstName: 'Ana', lastName: 'Ruiz', address: '', city: 'Madrid', telephone: '1234' })
                .exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('Please correct the highlighted fields.');
            expect(html).toContain('Address is required.');
            expect(html).toContain('Telephone must be 10 digits.');
            // The entered values survive the round trip…
            expect(html).toContain('value="Ana"');
            expect(html).toContain('value="Ruiz"');
            expect(html).toContain('value="Madrid"');
            expect(html).toContain('value="1234"');
            // …and each offending field is marked.
            expect(html).toContain('field field-error');
        });

        test('alpha and size rules are reported per field', async () => {
            const res = await http
                .post('/owners/new')
                .body({
                    firstName: '4nna',
                    lastName: 'Ruiz5',
                    address: 'Calle 1',
                    city: 'Madrid',
                    telephone: '6085551234',
                })
                .exec();

            const html = res.text();
            expect(html).toContain('First name must contain letters only.');
            expect(html).toContain('Last name must contain letters only.');
        });

        test('an empty body re-renders every required-field message', async () => {
            const res = await http.post('/owners/new').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            for (const message of [
                'First name is required.',
                'Last name is required.',
                'Address is required.',
                'City is required.',
                'Telephone is required.',
            ]) {
                expect(html).toContain(message);
            }
        });

        test('POST /owners/:id/edit re-renders the update form on invalid input', async () => {
            const res = await http
                .post('/owners/1/edit')
                .body({
                    firstName: 'George',
                    lastName: 'Franklin',
                    address: '110 W. Liberty St.',
                    city: '',
                    telephone: '6085551023',
                })
                .exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<h1>Edit owner</h1>');
            expect(html).toContain('action="/owners/1/edit"');
            expect(html).toContain('City is required.');
            expect(html).toContain('value="George"');
        });

        test('GET /owners/:id/edit prefills the form from the owner row', async () => {
            const res = await http.get('/owners/1/edit').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('action="/owners/1/edit"');
            expect(html).toContain('value="George"');
            expect(html).toContain('value="Franklin"');
            expect(html).toContain('value="110 W. Liberty St."');
            expect(html).toContain('<button type="submit">Update owner</button>');
        });

        test('GET /owners/:id/edit answers 404 for an unknown owner', async () => {
            const res = await http.get('/owners/404/edit').exec();

            expect(res.response.status).toBe(404);
        });
    });

    describe('pet forms', () => {
        test('GET /owners/:id/pets/new offers the pet types as a select', async () => {
            const res = await http.get('/owners/6/pets/new').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<h1>New pet</h1>');
            expect(html).toContain('action="/owners/6/pets/new"');
            expect(html).toContain('name="birthDate" type="date"');
            expect(html).toContain('<select id="typeId" name="typeId"');
            expect(html).toContain('<option value="">Choose a type</option>');
            expect(html).toContain('>cat</option>');
            expect(html).toContain('>hamster</option>');
        });

        test('a failed pet POST re-renders with values and messages', async () => {
            const res = await http.post('/owners/6/pets/new').body({ name: '', birthDate: 'soon', typeId: '' }).exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('Pet name is required.');
            expect(html).toContain('Birth date must be a real date (YYYY-MM-DD).');
            expect(html).toContain('Type is required.');
            expect(html).toContain('value="soon"');
        });

        test('a pet born in the future is rejected', async () => {
            const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
            const res = await http
                .post('/owners/6/pets/new')
                .body({ name: 'Chip', birthDate: future, typeId: '1' })
                .exec();

            expect(res.text()).toContain('Birth date cannot be in the future.');
        });

        test('a type id outside the seeded list is rejected by the store lookup', async () => {
            const res = await http
                .post('/owners/6/pets/new')
                .body({ name: 'Chip', birthDate: '2020-01-01', typeId: '99' })
                .exec();

            expect(res.response.status).toBe(200);
            expect(res.text()).toContain('Choose one of the listed pet types.');
        });

        test('GET /owners/:id/pets/:petId/edit prefills the pet form', async () => {
            const res = await http.get('/owners/6/pets/7/edit').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<h1>Edit pet</h1>');
            expect(html).toContain('action="/owners/6/pets/7/edit"');
            expect(html).toContain('value="Samantha"');
            expect(html).toContain('value="1995-09-04"');
            expect(html).toContain('<option value="1" selected>cat</option>');
        });

        test('a pet id that belongs to another owner is a 404, not a leak', async () => {
            // Pet 7 (Samantha) belongs to owner 6.
            const res = await http.get('/owners/1/pets/7/edit').exec();

            expect(res.response.status).toBe(404);
            expect(res.text()).toContain('No pet with id 7 exists.');
        });

        test('GET /owners/:id/pets/:petId/visits/new renders the visit form', async () => {
            const res = await http.get('/owners/6/pets/7/visits/new').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<h1>New visit</h1>');
            expect(html).toContain('action="/owners/6/pets/7/visits/new"');
            expect(html).toContain('name="visitDate" type="date"');
            expect(html).toContain('Samantha');
        });

        test('a failed visit POST re-renders with messages', async () => {
            const res = await http.post('/owners/6/pets/7/visits/new').body({ visitDate: '', description: '' }).exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('Visit date is required.');
            expect(html).toContain('Description is required.');
        });
    });

    describe('vet directory', () => {
        test('GET /vets lists five vets, ordered by name, with their specialties', async () => {
            const res = await http.get('/vets').exec();

            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<h1>Veterinarians</h1>');
            expect(html).toContain('James Carter');
            expect(html).toContain('Linda Douglas');
            expect(html).toContain('Helen Leary');
            expect(html).toContain('dentistry');
            expect(html).toContain('radiology');
            expect(html).toContain('Page 1 of 2');
            expect(html).not.toContain('Henry Stevens');
        });

        test('GET /vets?page=2 lists the remaining vet', async () => {
            const res = await http.get('/vets').query({ page: '2' }).exec();

            const html = res.text();
            expect(html).toContain('Henry Stevens');
            expect(html).toContain('Page 2 of 2');
        });

        test('a vet with no specialty renders the none label', async () => {
            const res = await http.get('/vets').exec();

            // James Carter and Sharon Jenkins have no specialty rows.
            expect(res.text()).toContain('<td>none</td>');
            expect(res.text()).toContain('>radiology<');
        });
    });

    describe('JSON representations', () => {
        test('GET /api/owners returns the first page of owner documents', async () => {
            const res = await http.get('/api/owners').exec();

            expect(res.response.status).toBe(200);
            expect(String(res.response.headers['content-type'])).toContain('application/json');
            const body = res.json() as {
                owners: Array<{
                    id: number;
                    lastName: string;
                    pets: Array<{ name: string; type: { name: string } | null }>;
                }>;
                page: number;
                size: number;
                totalElements: number;
                totalPages: number;
            };
            expect(body.page).toBe(1);
            expect(body.size).toBe(5);
            expect(body.totalElements).toBe(12);
            expect(body.totalPages).toBe(3);
            expect(body.owners).toHaveLength(5);
            expect(body.owners[0]?.lastName).toBe('Black');
            expect(body.owners[0]?.pets[0]?.name).toBe('Lucky');
            expect(body.owners[0]?.pets[0]?.type?.name).toBe('bird');
        });

        test('GET /api/owners?lastName= filters the list', async () => {
            const res = await http.get('/api/owners').query({ lastName: 'Davis' }).exec();

            const body = res.json() as { owners: Array<{ lastName: string }>; totalElements: number };
            expect(body.totalElements).toBe(3);
            expect(body.owners.map((owner) => owner.lastName)).toEqual(['Davis', 'Davis', 'Davis']);
        });

        test('GET /api/owners/:id returns one owner with pets, types and visits', async () => {
            const res = await http.get('/api/owners/6').exec();

            expect(res.response.status).toBe(200);
            const body = res.json() as {
                id: number;
                firstName: string;
                lastName: string;
                telephone: string;
                pets: Array<{
                    id: number;
                    name: string;
                    birthDate: string;
                    type: { id: number; name: string } | null;
                    visits: Array<{ id: number; date: string; description: string }>;
                }>;
            };
            expect(body.id).toBe(6);
            expect(body.firstName).toBe('Jean');
            expect(body.lastName).toBe('Coleman');
            expect(body.telephone).toBe('6085552654');
            expect(body.pets.map((pet) => pet.name)).toEqual(['Samantha', 'Max']);
            expect(body.pets[0]?.type).toEqual({ id: 1, name: 'cat' });
            // Newest first: Max's 2011 shot precedes its 2009 neutering.
            expect(body.pets[1]?.visits.map((visit) => visit.date)).toEqual(['2011-03-04', '2009-06-04']);
            expect(body.pets[0]?.visits[0]?.description).toBe('rabies shot');
        });

        test('GET /api/owners/:id answers a 404 problem document', async () => {
            const res = await http.get('/api/owners/999').exec();

            expect(res.response.status).toBe(404);
            expect(String(res.response.headers['content-type'])).toContain('application/problem+json');
            expect(res.json()).toMatchObject({
                type: 'urn:blue:not-found',
                title: 'Not Found',
                status: 404,
                detail: 'owner 999 not found',
                instance: '/api/owners/999',
            });
        });

        test('GET /api/vets returns the vet documents with their specialties', async () => {
            const res = await http.get('/api/vets').exec();

            expect(res.response.status).toBe(200);
            const body = res.json() as {
                vets: Array<{ id: number; firstName: string; lastName: string; specialties: Array<{ name: string }> }>;
                page: number;
                size: number;
                totalElements: number;
                totalPages: number;
            };
            expect(body.page).toBe(1);
            expect(body.size).toBe(5);
            expect(body.totalElements).toBe(6);
            expect(body.totalPages).toBe(2);
            expect(body.vets.map((vet) => vet.lastName)).toEqual(['Carter', 'Douglas', 'Jenkins', 'Leary', 'Ortega']);
            // Specialties come back ordered by name, and an unassigned vet is an empty list.
            expect(body.vets[0]?.specialties).toEqual([]);
            expect(body.vets[1]?.specialties.map((specialty) => specialty.name)).toEqual(['dentistry', 'surgery']);
            expect(body.vets[3]?.specialties.map((specialty) => specialty.name)).toEqual(['radiology']);

            const second = (await http.get('/api/vets').query({ page: '2' }).exec()).json() as typeof body;
            expect(second.vets.map((vet) => vet.lastName)).toEqual(['Stevens']);
        });

        test('an unrouted path is a 404 problem document', async () => {
            const res = await http.get('/nope').exec();

            expect(res.response.status).toBe(404);
            expect(res.json()).toMatchObject({ status: 404, type: 'urn:blue:not-found' });
        });
    });

    describe('writes', () => {
        test('the create-owner form round-trips a real urlencoded body and redirects', async () => {
            // The exact bytes a browser submits for this form.
            const res = await http
                .post('/owners/new')
                .headers(FORM)
                .rawBody('firstName=Ana&lastName=Ruiz&address=Calle+Mayor+7&city=Madrid&telephone=6085551234')
                .exec();

            expect(res.response.status).toBe(302);
            expect(res.response.headers['location']).toBe('/owners/13');

            const detail = await http.get('/owners/13').exec();
            expect(detail.response.status).toBe(200);
            expect(detail.text()).toContain('<h1>Ana Ruiz</h1>');
            expect(detail.text()).toContain('Calle Mayor 7');
            expect(detail.text()).toContain('This owner has no pets yet.');

            const search = await http.get('/owners').query({ lastName: 'Ruiz' }).exec();
            expect(search.text()).toContain('Ruiz, Ana');
        });

        test('the update-owner form persists the change and redirects', async () => {
            const res = await http
                .post('/owners/1/edit')
                .body({
                    firstName: 'George',
                    lastName: 'Franklin',
                    address: '110 W. Liberty St.',
                    city: 'Sun Prairie',
                    telephone: '6085551023',
                })
                .exec();

            expect(res.response.status).toBe(302);
            expect(res.response.headers['location']).toBe('/owners/1');

            const detail = await http.get('/owners/1').exec();
            expect(detail.text()).toContain('Sun Prairie');
        });

        test('the add-pet form persists the pet and redirects to the owner', async () => {
            const res = await http
                .post('/owners/6/pets/new')
                .body({ name: 'Chip', birthDate: '2020-01-15', typeId: '6' })
                .exec();

            expect(res.response.status).toBe(302);
            expect(res.response.headers['location']).toBe('/owners/6');

            const detail = await http.get('/owners/6').exec();
            expect(detail.text()).toContain('Chip');
            expect(detail.text()).toContain('hamster');
            expect(detail.text()).toContain('Jan 15, 2020');
        });

        test('the update-pet form persists the change and redirects', async () => {
            const res = await http
                .post('/owners/6/pets/7/edit')
                .body({ name: 'Samantha', birthDate: '1996-01-02', typeId: '1' })
                .exec();

            expect(res.response.status).toBe(302);
            expect(res.response.headers['location']).toBe('/owners/6');

            const form = await http.get('/owners/6/pets/7/edit').exec();
            expect(form.text()).toContain('value="1996-01-02"');

            const api = await http.get('/api/owners/6').exec();
            const body = api.json() as { pets: Array<{ id: number; birthDate: string }> };
            expect(body.pets.find((pet) => pet.id === 7)?.birthDate).toBe('1996-01-02');
        });

        test('the add-visit form records the visit and redirects to the owner', async () => {
            const res = await http
                .post('/owners/6/pets/7/visits/new')
                .body({ visitDate: '2024-05-06', description: 'annual checkup' })
                .exec();

            expect(res.response.status).toBe(302);
            expect(res.response.headers['location']).toBe('/owners/6');

            const detail = await http.get('/owners/6').exec();
            expect(detail.text()).toContain('May 6, 2024');
            expect(detail.text()).toContain('annual checkup');
        });

        test('a visit posted for another owner’s pet is a 404', async () => {
            const res = await http
                .post('/owners/1/pets/7/visits/new')
                .body({ visitDate: '2024-05-06', description: 'nope' })
                .exec();

            expect(res.response.status).toBe(404);
        });
    });
});
