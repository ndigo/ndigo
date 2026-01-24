import { describe, test, expect } from 'vitest';
import Validator from '../src/validator';
import Type from '../src/type';
import types from '../src/types';

const typeValidValues: Record<string, any> = {
        AccountNumber: 23252325,
        AccountMaskNumber: 'xxxxx1234',
        AlertsProfileNickname: 'N1ckName_3 Zuba',
        AddressLine: '1000 whodey',
        AddressLine__1: '',

        Category: 'ab',
        Category__1: 'abcde',
        Category__2: '123',
        City: 'Columbus',

        Date: '08/22/2013',
        Date__1: '',
        Description: 'Hello World and others',
        Description__1: 'Valid',

        Email: 'test@test.com',
        Email__1: 'T2223334444@t-mobile.net',

        Frequency: 'Daily',
        Id: '123hellow12',
        IdentificationCode: 84544587,
        Money: 22.31,
        Money__1: '22,310.00',
        Money__2: '0010',
        OnOff: true,
        Password: 'test#1H1~',
        Password__1: 'te@s$t%12{1:2}!',
        Password__2: 'te@s$t%89:',
        Password__3: 'test01yz{',
        Password__4: 'test01zy',
        Password__5: 'test01,-.',
        Payee: 'hello',
        Phone: 1231238765,
        Phone__1: '1231238765',
        Phone__2: '123-123-8765',
        PostalCode: 901250003,
        ProspectApplicantId: 'ABC123',
        Rate: 0.22,
        RSAToken: '12345678901234567890123456789012345',
        RoutingNumber: '044000037',
        RoutingNumber__1: '021000089', // Citi
        RoutingNumber__2: '314074269', // USAA
        SimpleUserId: '123',
        UserId: 'hellouser1',
        UserSecurityCode: '812388fdak',
        TaxpayerIdentification: '123456789',
        ZipCode: 90125,
        ZipCodeExtension: '0000',
    },
    typeInvalidValues: Record<string, any> = {
        AccountNumber: 123,
        AccountMaskNumber: 'xxx0xxx1xxxx1234',
        AccountMaskNumber__1: '_xxxxxxxxxxx1234',
        AccountMaskNumber__2: 'xxxxxxxxxxx01234',
        AccountMaskNumber__3: '1234',
        AlertsProfileNickname: 'N1ckNam3#',
        AddressLine: '1000 whodey &*%&#(*',
        Category: 'h',
        City: 'Col#*&',
        Date: '09-20-2013',
        Description: '',

        Email: 'test@test@test.com',
        Email__1: '2223334444@t-mobile.net',

        Frequency: 'hello',
        Id: 'hello',
        IdentificationCode: 'hello',
        Money: 'hello',
        OnOff: 'hello',

        Password: 'hello',
        Password__1: 'hellothispasswordistoolongforthevalidationrequirements1!',
        Password__2: 'testing2&',
        Password__3: 'testing3<',
        Password__4: 'testing4>',
        Password__5: 'testing5abc',
        Password__6: 'testing5aBc',
        Password__7: '321testing6',
        Password__8: 'testing111',
        Password__9: 'testing123',
        Password__10: 'test01!"',

        Payee: '1234567890123456789012345678901',
        Phone: 'hello',
        Phone__1: '123-123-123',
        Phone__2: '1234-123-123',
        Phone__3: '123-1231234',
        Phone__4: '123123-1234',
        PostalCode: '901256-0003',
        ProspectApplicantId: 'ABC12',
        Rate: 'hello',
        RSAToken: '1234567890123456789012345678901234a',
        RoutingNumber: 'hello',
        RoutingNumber__1: '0214089',
        SimpleUserId: '333',
        TaxpayerIdentification: 'ochocinco',
        UserId: 'hello',
        UserSecurityCode: 'blah',
        ZipCode: 901256,
        ZipCodeExtension: 10003,
    };

let validator: Validator;

// Add semantic constraints
Object.keys(types).forEach((name) => {
    (Type as any)[name] = new Type(name, types[name as keyof typeof types]);
});

validator = new Validator(Type);

// validator = new Validator(Constraint);

describe('Validator', () => {
    test('it should be an object', () => {
        expect(typeof validator).toBe('object');
    });

    test('it should have a validate method', () => {
        expect(validator.validate).toBeInstanceOf(Function);
    });

    describe.skip('Valid Values', () => {
        // expect(validator.validate(typeValidValues[ 'Date' ], 'Date', {format: 'MM-DD-YYYY'}).isValid).toBe( true );

        Object.keys(types).forEach((name) => {
            test(`it should validate "${name}" with "${typeValidValues[name]}"`, () => {
                expect(validator.validate(typeValidValues[name], name, {}).isValid).toBe(true);
            });

            // Up to four 5 value tests per type
            let typeName: string;
            for (let i = 1; i < 5; i++) {
                typeName = name + '__' + i;
                if (typeValidValues.hasOwnProperty(typeName)) {
                    test(`it should validate "${name}" with "${typeValidValues[typeName]}"`, () => {
                        expect(validator.validate(typeValidValues[typeName], name, {}).isValid).toBe(true);
                    });
                }
            }
        });

        test('it should validate "Date" with custom format DD-MM-YY', () => {
            expect(validator.validate('22-08-15', 'Date', { format: 'DD-MM-YY' }).isValid).toBe(true);
            expect(validator.validate('', 'Date', { format: 'DD-MM-YY' }).isValid).toBe(true);
        });
    });

    describe.skip('Invalid Values', () => {
        Object.keys(types).forEach((name) => {
            // Do not perform the action for Noop
            if (name === 'Noop' || name === 'List') {
                return;
            }

            test(`it should invalidate "${name}" with "${typeInvalidValues[name]}"`, () => {
                expect(validator.validate(typeInvalidValues[name], name, {}).isValid).toBe(false);
            });

            // Up to four 10 value tests per type
            let typeName: string;

            for (let i = 1; i < 10; i++) {
                typeName = name + '__' + i;
                if (typeInvalidValues.hasOwnProperty(typeName)) {
                    test(`it should invalidate "${name}" with "${typeInvalidValues[name]}"`, () => {
                        expect(validator.validate(typeInvalidValues[typeName], name, {}).isValid).toBe(false);
                    });
                }
            }
        });

        test('it should invalidate "Date" with incomplete/partial tokens', () => {
            expect(validator.validate('is 2012-05-25', 'Date', { format: 'YYYY-MM-DD' }).isValid).toBe(false);
        });
    });
});
