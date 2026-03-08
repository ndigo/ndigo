import { describe, test, expect } from 'vitest';
import types from '../src/types';
import Type from '../src/type';
import { validationGroup } from '../src/group';

Object.keys(types).forEach((name) => ((Type as any)[name] = new Type(name, types[name as keyof typeof types])));

const {
        AccountMaskNumber,
        AccountNumber,
        AddressLine,
        AlertsProfileNickname,
        Category,
        City,
        Description,
        Email,
        Frequency,
        Id,
        IdentificationCode,
        Money,
        OnOff,
        Password,
        Payee,
        Phone,
        PostalCode,
        ProspectApplicantId,
        Rate,
        RoutingNumber,
        RSAToken,
        SimpleUserId,
        TaxpayerIdentification,
        UserId,
        UserSecurityCode,
        ZipCode,
        ZipCodeExtension,
    } = Type as any,
    _Date = (Type as any).Date;

describe('Type', () => {
    test('it should create instances', () => {
        const decimalRangeType = new Type('decimalRange', {
            constraints: [
                {
                    type: 'Range',
                },
                {
                    type: 'Digits',
                    params: {
                        integer: 10,
                        fraction: 2,
                    },
                },
            ],
        });

        expect(decimalRangeType.validate(15, { min: 10, max: 20 }).isValid).toBe(true);
        expect(decimalRangeType.validate(25, { min: 10, max: 20 }).isValid).toBe(false);
        expect(decimalRangeType).toBeInstanceOf(Type);
        expect(() => {
            new Type({} as any);
        }).toThrow(TypeError);
    });

    describe('validation groups', () => {
        const createGroup = validationGroup('create');
        const updateGroup = validationGroup('update');

        test('it should evaluate only matching grouped constraints', () => {
            const groupedType = new Type('GroupedType', {
                constraints: [
                    {
                        type: 'NotBlank',
                    },
                    {
                        type: 'Length',
                        params: {
                            min: 5,
                        },
                        groups: [createGroup],
                    },
                ],
            });

            expect(groupedType.validate('abc', { groups: [updateGroup] }).isValid).toBe(true);
            expect(groupedType.validate('abc', { groups: [createGroup] }).isValid).toBe(false);
            expect(groupedType.validate('abcde', { groups: [createGroup] }).isValid).toBe(true);
        });
    });

    describe('AccountMaskNumber', () => {
        test('it should validate account mask numbers', () => {
            //Pass
            expect(AccountMaskNumber.validate('abc1234').isValid).toBe(true);
            expect(AccountMaskNumber.validate('abcdefgh5678').isValid).toBe(true);

            //Fail
            expect(AccountMaskNumber.validate('ab1234').isValid).toBe(false);
            expect(AccountMaskNumber.validate('ab12345').isValid).toBe(false);
            expect(AccountMaskNumber.validate('1234abc').isValid).toBe(false);
        });
    });

    describe('AccountNumber', () => {
        test('it should validate account numbers', () => {
            //Pass
            expect(AccountNumber.validate('abcd1234').isValid).toBe(true);
            expect(AccountNumber.validate('abcdefgh12345678').isValid).toBe(true);

            //Fail
            expect(AccountNumber.validate('abcd123').isValid).toBe(false);
            expect(AccountNumber.validate('abcdefghi12345678').isValid).toBe(false);
        });
    });

    describe('AddressLine', () => {
        test('it should validate address lines', () => {
            //Pass
            expect(AddressLine.validate('1000 whodey').isValid).toBe(true);

            //Fail
            expect(AddressLine.validate('1000 whodey &*%&#(*').isValid).toBe(false);
            expect(AddressLine.validate('11111111111111111111111111111111111111111').isValid).toBe(false);
        });
    });

    describe('AlertsProfileNickname', () => {
        test('it should validate alerts profile nickname', () => {
            //Pass
            expect(AlertsProfileNickname.validate('abcd1234_').isValid).toBe(true);

            //Fail
            expect(AlertsProfileNickname.validate('abcd1234_&*%&#(*').isValid).toBe(false);
        });
    });

    describe('Category', () => {
        test('it should validate categories', () => {
            //Pass
            expect(Category.validate('12').isValid).toBe(true);
            expect(Category.validate('abc').isValid).toBe(true);
            expect(Category.validate('#@$%').isValid).toBe(true);

            //Fail
            expect(Category.validate('1').isValid).toBe(false);
        });
    });

    describe('City', () => {
        test('it should validate cities', () => {
            //Pass
            expect(City.validate('Columbus').isValid).toBe(true);
            expect(City.validate('Salt Lake City').isValid).toBe(true);
            expect(City.validate('St. Louis').isValid).toBe(true);
            expect(City.validate('Gruetli-Laager').isValid).toBe(true);
            expect(City.validate('Saint Louis Du-Ha-Ha').isValid).toBe(true);
            expect(City.validate('San Jose').isValid).toBe(true);

            //Fail
            expect(City.validate('San José').isValid).toBe(false);
            expect(City.validate('City#1').isValid).toBe(false);
            expect(City.validate('City_1').isValid).toBe(false);
            expect(City.validate('Feliz Cumpleaños').isValid).toBe(false);
            expect(City.validate('Überville').isValid).toBe(false);
            expect(City.validate('Los  Angeles').isValid).toBe(false);
        });
    });

    describe('Description', () => {
        test('it should validate descriptions', () => {
            //Pass
            expect(Description.validate('abcd1234^%&*)(_+=').isValid).toBe(true);

            //Fail
            expect(Description.validate('').isValid).toBe(false);
        });
    });

    describe('Date', () => {
        test('it should validate dates', () => {
            //Pass
            expect(_Date.validate('11/15/1976').isValid).toBe(true);

            //Fail
            expect(_Date.validate('11-15-1976').isValid).toBe(false);
        });
    });

    describe('Email', () => {
        test('it should validate email addresses', () => {
            expect(Email.validate('abc').isValid).toBe(false);
            expect(Email.validate('abc123').isValid).toBe(false);
            expect(Email.validate('123').isValid).toBe(false);
            expect(Email.validate('1.23').isValid).toBe(false);
            expect(Email.validate('').isValid).toBe(false);
            expect(Email.validate(null).isValid).toBe(false);
            expect(Email.validate(undefined).isValid).toBe(false);
            expect(Email.validate(123).isValid).toBe(false);
            expect(Email.validate(1.23).isValid).toBe(false);
            expect(Email.validate(true).isValid).toBe(false);
            expect(Email.validate('FALSE').isValid).toBe(false);
            expect(Email.validate('abc@').isValid).toBe(false);
            expect(Email.validate('abc123@as').isValid).toBe(false);
            expect(Email.validate('123.com@bac').isValid).toBe(false);
            expect(Email.validate('123bac.com').isValid).toBe(false);
            expect(Email.validate('123@bac@def.com').isValid).toBe(false);
            expect(Email.validate('123.bac.com').isValid).toBe(false);
            expect(Email.validate('123@bac.c').isValid).toBe(false);
            expect(Email.validate('123@bac.1').isValid).toBe(false);
            expect(Email.validate('123@bac.1c').isValid).toBe(true);
            expect(Email.validate('123@bac.1111').isValid).toBe(true);
            expect(Email.validate('123.bac@chase.com').isValid).toBe(true);
            expect(Email.validate('abc.bac@chase.uk').isValid).toBe(true);
            expect(Email.validate('my@test.com').isValid).toBe(true);
            expect(Email.validate('3334445555@test.com').isValid).toBe(false);
            expect(Email.validate('2223335555@test.com').isValid).toBe(false);
            expect(Email.validate('A2223335555@test.com').isValid).toBe(true);
        });
    });

    describe('Frequency', () => {
        test('it should validate frequencies', () => {
            //Pass
            expect(Frequency.validate('Daily').isValid).toBe(true);
            expect(Frequency.validate('Weekly').isValid).toBe(true);
            expect(Frequency.validate('Monthly').isValid).toBe(true);

            //Fail
            expect(Frequency.validate('Yearly').isValid).toBe(false);
        });
    });

    describe('Id', () => {
        test('it should validate ids', () => {
            //Pass
            expect(Id.validate('abcde1').isValid).toBe(true);
            expect(Id.validate('abc123').isValid).toBe(true);

            //Fail
            expect(Id.validate('abcd1').isValid).toBe(false);
            expect(Id.validate('abcdef').isValid).toBe(false);
            expect(Id.validate('abc123!').isValid).toBe(false);
        });
    });

    describe('IdentificationCode', () => {
        test('it should validate id codes', () => {
            //Pass
            expect(IdentificationCode.validate('12345678').isValid).toBe(true);
            expect(IdentificationCode.validate('-1234567').isValid).toBe(true);
            expect(IdentificationCode.validate(12345678).isValid).toBe(true);
            expect(IdentificationCode.validate(-1234567).isValid).toBe(true);

            //Fail
            expect(IdentificationCode.validate('123456789').isValid).toBe(false);
            expect(IdentificationCode.validate('-12345678').isValid).toBe(false);
            expect(IdentificationCode.validate(123456789).isValid).toBe(false);
            expect(IdentificationCode.validate(-12345678).isValid).toBe(false);
        });
    });

    describe('Money', () => {
        test('it should not accept wild entries', () => {
            expect(Money.validate('12/10/1999').isValid).toBe(false);
            expect(Money.validate('12-10-1999').isValid).toBe(false);
            expect(Money.validate('4/5').isValid).toBe(false);
            expect(Money.validate('dasjkfjsiou').isValid).toBe(false);
        });

        test('it should validate JS numbers', () => {
            expect(Money.validate(199.99).isValid).toBe(true);
            expect(Money.validate(100).isValid).toBe(true);
            //expect( Money.validate(0100).isValid).toBe( true ); //will render as 100 before validating
            expect(Money.validate(43342.32432).isValid).toBe(false);
        });

        test('it should validate USD', () => {
            expect(Money.validate('$35,000.77', { format: 'USD' }).isValid).toBe(true);
            expect(Money.validate('$35,000.77').isValid).toBe(true);
            expect(Money.validate('35,000.77').isValid).toBe(true);
            expect(Money.validate('$35.77').isValid).toBe(true);
            expect(Money.validate('$35,000').isValid).toBe(true);
            expect(Money.validate('$35').isValid).toBe(true);
            expect(Money.validate('35.77').isValid).toBe(true);
            expect(Money.validate('0.77').isValid).toBe(true);
            expect(Money.validate('35').isValid).toBe(true);
            expect(Money.validate('35,000').isValid).toBe(true);
            expect(Money.validate('$0.77').isValid).toBe(true);
            expect(Money.validate('$.09').isValid).toBe(true);
            expect(Money.validate('15.').isValid).toBe(true);
            expect(Money.validate('15.0').isValid).toBe(true);
            expect(Money.validate('.5').isValid).toBe(true);
            expect(Money.validate('100,000').isValid).toBe(true);
            expect(Money.validate('1,000,000').isValid).toBe(true);
            expect(Money.validate('10,000,000').isValid).toBe(true);
            expect(Money.validate('100,000,000').isValid).toBe(true);
            expect(Money.validate('1,000,000,000').isValid).toBe(true);
            expect(Money.validate('10,000,000.00').isValid).toBe(true);
            expect(Money.validate('100000').isValid).toBe(true);
            expect(Money.validate('1000000').isValid).toBe(true);
            expect(Money.validate('10000000').isValid).toBe(true);
            expect(Money.validate('100000000').isValid).toBe(true);
            expect(Money.validate('1000000000').isValid).toBe(true);
            expect(Money.validate('10000000.00').isValid).toBe(true);
            expect(Money.validate('$0.').isValid).toBe(true);
            expect(Money.validate('$.0').isValid).toBe(true);
            expect(Money.validate('$1.').isValid).toBe(true);
            expect(Money.validate('$.1').isValid).toBe(true);
            expect(Money.validate('0.').isValid).toBe(true);
            expect(Money.validate('.0').isValid).toBe(true);
            expect(Money.validate('1.').isValid).toBe(true);
            expect(Money.validate('.1').isValid).toBe(true);
            expect(Money.validate('       .1   ').isValid).toBe(true);
            expect(Money.validate('0010').isValid).toBe(true);
            expect(Money.validate('$000,000,001.00').isValid).toBe(true);
            expect(Money.validate('000009292930000').isValid).toBe(true);
            expect(Money.validate('099.99').isValid).toBe(true);
        });

        test('it should NOT validate USD', () => {
            expect(Money.validate('10.000').isValid).toBe(false);
            expect(Money.validate('$$10').isValid).toBe(false);
            expect(Money.validate('0.0.00').isValid).toBe(false);
            expect(Money.validate('.0909').isValid).toBe(false);
            expect(Money.validate('0..09').isValid).toBe(false);
            expect(Money.validate('   ').isValid).toBe(false);
            expect(Money.validate('').isValid).toBe(false);
            expect(Money.validate(' . ').isValid).toBe(false);
            expect(Money.validate('.').isValid).toBe(false);
            expect(Money.validate('$').isValid).toBe(false);
            expect(Money.validate('$.').isValid).toBe(false);
            expect(Money.validate('$.0,000').isValid).toBe(false);
            expect(Money.validate('$1,00,00.00').isValid).toBe(false);
            expect(Money.validate('$12,34,56.78').isValid).toBe(false);
            expect(Money.validate('$,500,000').isValid).toBe(false);
            expect(Money.validate('$500,,000').isValid).toBe(false);
            expect(Money.validate('$,500.00').isValid).toBe(false);
            expect(Money.validate('$1,00,00,000.00').isValid).toBe(false);
            expect(Money.validate('$10,000000.00').isValid).toBe(false);
        });

        // test currency formats
        const test1 = {
                decimal: ',',
                decimalDigits: 2,
                kDelim: '.',
                symbol: 'ƒ',
                symbolBegin: true,
                regex: /^\s*ƒ?((\d+|\d{1,3}(\.\d{3})*)(,\d{0,2})?|,\d{1,2})\s*$/,
            },
            test2 = {
                decimal: '.',
                decimalDigits: 1,
                kDelim: ',',
                symbol: '$',
                symbolBegin: true,
                regex: /^\s*\$?((\d+|\d{1,3}(,\d{3})*)(\.\d?)?|\.\d)\s*$/,
            },
            test3 = {
                decimal: '.',
                decimalDigits: 2,
                kDelim: ',',
                symbol: '&',
                symbolBegin: false,
                regex: /^\s*((\d+|\d{1,3}(,\d{3})*)(\.\d{0,2})?|\.\d{1,2})&?\s*$/,
            };

        test('it should validate test format test1', () => {
            expect(Money.validate('ƒ35.000,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35.000,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ35,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ35.000', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ35', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('0,77', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('35.000', { currencyFormat: test1 }).isValid).toBe(true);
            expect(Money.validate('ƒ0,77', { currencyFormat: test1 }).isValid).toBe(true);
        });

        test('it should NOT validate test format test1', () => {
            expect(Money.validate('ƒ35,000.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('35,000.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('ƒ35.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('ƒ35,000', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('0.77', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('35,000', { currencyFormat: test1 }).isValid).toBe(false);
            expect(Money.validate('ƒ0.77', { currencyFormat: test1 }).isValid).toBe(false);
        });

        test('it should validate test format test2', () => {
            expect(Money.validate('$35,000.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35,000.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$35.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$35,000', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$35', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('0.7', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35.', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('35,000', { currencyFormat: test2 }).isValid).toBe(true);
            expect(Money.validate('$0.7', { currencyFormat: test2 }).isValid).toBe(true);
        });

        test('it should NOT validate test format test2', () => {
            expect(Money.validate('$35,000.77', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('35.000.77', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('$35.77', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('$35.000', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('35.7777', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('0.777', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('35.000', { currencyFormat: test2 }).isValid).toBe(false);
            expect(Money.validate('$.700', { currencyFormat: test2 }).isValid).toBe(false);
        });

        test('it should validate test format test3', () => {
            expect(Money.validate('35,000.77&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35,000.77', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35.77&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35,000&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35&', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35.77', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('0.77', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('35,000', { currencyFormat: test3 }).isValid).toBe(true);
            expect(Money.validate('0.77&', { currencyFormat: test3 }).isValid).toBe(true);
        });

        test('it should NOT validate test format test3', () => {
            expect(Money.validate('35.000,77&', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35.000,77', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35,77&', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35.000&', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('0,77', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('35.000', { currencyFormat: test3 }).isValid).toBe(false);
            expect(Money.validate('0.777&', { currencyFormat: test3 }).isValid).toBe(false);
        });
    });

    describe('OnOff', () => {
        test('it should validate on-off', () => {
            //Pass
            expect(OnOff.validate('true').isValid).toBe(true);
            expect(OnOff.validate('false').isValid).toBe(true);
            expect(OnOff.validate(true).isValid).toBe(true);
            expect(OnOff.validate(false).isValid).toBe(true);

            //Fail
            expect(OnOff.validate('abcd').isValid).toBe(false);
            expect(OnOff.validate('1234').isValid).toBe(false);
            expect(OnOff.validate(1).isValid).toBe(false);
            expect(OnOff.validate(0).isValid).toBe(false);
        });
    });

    describe('Password', () => {
        test('it should validate passwords', () => {
            //Pass
            expect(Password.validate('test#1H1~').isValid).toBe(true);
            expect(Password.validate('te@s$t%12{1:2}!').isValid).toBe(true);
            expect(Password.validate('te@s$t%89:').isValid).toBe(true);
            expect(Password.validate('test01yz{').isValid).toBe(true);
            expect(Password.validate('test01zy').isValid).toBe(true);
            expect(Password.validate('test01,-.').isValid).toBe(true);

            //Fail
            expect(Password.validate('hello').isValid).toBe(false);
            expect(Password.validate('hellothispasswordistoolongforthevalidationrequirements1!').isValid).toBe(false);
            expect(Password.validate('testing2&').isValid).toBe(false);
            expect(Password.validate('testing3<').isValid).toBe(false);
            expect(Password.validate('testing4>').isValid).toBe(false);
            // At some point these were supposed to fail but they pass now? -JBR
            //expect( Password.validate( 'testing5abc' ).isValid ).toBe( false );
            //expect( Password.validate( 'testing5aBc' ).isValid ).toBe( false );
            //expect( Password.validate( '321testing6' ).isValid ).toBe( false );
            expect(Password.validate('testing111').isValid).toBe(false);
            //expect( Password.validate( 'testing123' ).isValid ).toBe( false );
            expect(Password.validate('test01!"').isValid).toBe(false);
        });
    });

    describe('Payee', () => {
        test('it should validate payees', () => {
            //Pass
            expect(Payee.validate('123456789012345678901234567890').isValid).toBe(true);

            //Fail
            expect(Payee.validate('123456789012345678901234567890!').isValid).toBe(false);
        });
    });

    describe('Phone', () => {
        test('it should validate phone numbers', () => {
            //Pass
            expect(Phone.validate('6149852859').isValid).toBe(true);
            expect(Phone.validate('614-985-2859').isValid).toBe(true);

            //Fail
            expect(Phone.validate('16149852859').isValid).toBe(false);
            expect(Phone.validate('1-614-985-2859').isValid).toBe(false);
        });
    });

    describe('PostalCode', () => {
        test('it should validate postal codes', () => {
            //Pass
            expect(PostalCode.validate('43240').isValid).toBe(true);
            expect(PostalCode.validate(432402110).isValid).toBe(true);

            //Fail
            expect(PostalCode.validate('43240-2110').isValid).toBe(false);
            expect(PostalCode.validate(4324021101).isValid).toBe(false);
        });
    });

    describe('ProspectApplicantId', () => {
        test('it should validate prospect applicant id', () => {
            //Pass
            expect(ProspectApplicantId.validate('abc123').isValid).toBe(true);

            //Fail
            expect(ProspectApplicantId.validate('abc12').isValid).toBe(false);
        });
    });

    describe('Rate', () => {
        test('it should validate rates', () => {
            //Pass
            expect(Rate.validate(0.22).isValid).toBe(true);
            expect(Rate.validate('0.22').isValid).toBe(true);

            //Fail
            expect(Rate.validate('1.00').isValid).toBe(false);
        });
    });

    describe('RoutingNumber', () => {
        test('it should validate routing numbers', () => {
            //Pass
            expect(RoutingNumber.validate('044000037').isValid).toBe(true);
            expect(RoutingNumber.validate('021000089').isValid).toBe(true);
            expect(RoutingNumber.validate('314074269').isValid).toBe(true);

            //Fail
            expect(RoutingNumber.validate('hello').isValid).toBe(false);
            expect(RoutingNumber.validate('0214089').isValid).toBe(false);
        });
    });

    describe('RSAToken', () => {
        test('it should validate RSA tokens', () => {
            //Pass
            expect(RSAToken.validate('12345678901234567890123456789012345').isValid).toBe(true);
            //Fail
            expect(RSAToken.validate('1234567890123456789012345678901234a').isValid).toBe(false);
        });
    });

    describe('SimpleUserId', () => {
        test('it should validate simple user ids', () => {
            //Pass
            expect(SimpleUserId.validate('abc').isValid).toBe(true);
            //Fail
            expect(SimpleUserId.validate('aaa').isValid).toBe(false);
        });
    });

    describe('TaxpayerIdentification', () => {
        test('it should validate simple user ids', () => {
            //Pass
            expect(TaxpayerIdentification.validate('123-45-6789').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('123456789').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('12-3456789').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('XXX-XX-XXXX').isValid).toBe(true);
            expect(TaxpayerIdentification.validate('XX-XXXXXXX').isValid).toBe(true);
            //Fail
            expect(TaxpayerIdentification.validate('abcdefghi').isValid).toBe(false);
            expect(TaxpayerIdentification.validate('XXXXXXXXX').isValid).toBe(false);
            expect(TaxpayerIdentification.validate('1234567-89').isValid).toBe(false);
        });
    });

    describe('UserId', () => {
        test('it should validate user ids', () => {
            //Pass
            expect(UserId.validate('abcd1234').isValid).toBe(true);
            expect(UserId.validate('123456789012345678901234567890ab').isValid).toBe(true);
            //Fail
            expect(UserId.validate('abcd123').isValid).toBe(false);
            expect(UserId.validate('abcdefgh').isValid).toBe(false);
            expect(UserId.validate('12345678').isValid).toBe(false);
            expect(UserId.validate('abcd1234!').isValid).toBe(false);
            expect(UserId.validate('123456789012345678901234567890123').isValid).toBe(false);
        });
    });

    describe('UserSecurityCode', () => {
        test('it should validate user security codes', () => {
            //Pass
            expect(UserSecurityCode.validate('abcd1234').isValid).toBe(true);
            expect(UserSecurityCode.validate('123456789012345678901234567890ab').isValid).toBe(true);
            //Fail
            expect(UserSecurityCode.validate('abcd123').isValid).toBe(false);
            expect(UserSecurityCode.validate('abcdefgh').isValid).toBe(false);
            expect(UserSecurityCode.validate('12345678').isValid).toBe(false);
            expect(UserSecurityCode.validate('abcd1234!').isValid).toBe(false);
            expect(UserSecurityCode.validate('123456789012345678901234567890123').isValid).toBe(false);
        });
    });

    describe('ZipCode', () => {
        test('it should validate user zip codes', () => {
            //Pass
            expect(ZipCode.validate('43240').isValid).toBe(true);
            expect(ZipCode.validate(43240).isValid).toBe(true);
            //Fail
            expect(ZipCode.validate('432401').isValid).toBe(false);
            expect(ZipCode.validate(432401).isValid).toBe(false);
            expect(ZipCode.validate('43240-2110').isValid).toBe(false);
        });
    });

    describe('ZipCodeExtension', () => {
        test('it should validate user zip codes', () => {
            //Pass
            expect(ZipCodeExtension.validate('2110').isValid).toBe(true);
            expect(ZipCodeExtension.validate(2110).isValid).toBe(true);
            //Fail
            expect(ZipCodeExtension.validate('21101').isValid).toBe(false);
            expect(ZipCodeExtension.validate('43240-2110').isValid).toBe(false);
        });
    });
});
