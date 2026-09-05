/**
 * @namespace module:validate.types
 */

/**
 * @typedef BusinessType
 * @property {Array} constraints
 */

const standardTypes = {
    // Always include constraints for each spec type

    // As per Jon Spy 6/26 len varies by LoB/Acct-Type; details pending from Enterprise
    // CIG zero-pads to 23 before writing to Profile after triggered online/offline CAMM call
    /**
     */
    AccountNumber: {
        constraints: [
            {
                type: 'AlphaNumeric',
            },
            {
                type: 'Length',
                params: {
                    min: 8,
                    max: 16,
                },
            },
        ],
    },

    // BLUEJS-913 - Alphanumeric, min 7 characters and ends with 4 digits
    AccountMaskNumber: {
        constraints: [
            {
                type: 'AlphaNumeric',
            },
            {
                type: 'Length',
                params: {
                    min: 7,
                },
            },
            {
                type: 'Numbers',
                params: {
                    min: 4,
                    max: 4,
                },
            },
            {
                type: 'Pattern',
                params: {
                    regex: '/(\\d){4}$/',
                },
            },
        ],
    },

    AddressLine: {
        constraints: [
            {
                type: 'AddressLine',
            },
        ],
    },

    AlertsProfileNickname: {
        constraints: [
            {
                type: 'Pattern',
                params: {
                    regex: '/[A-Z a-z 0-9 _]$/',
                },
            },
        ],
    },

    Category: {
        constraints: [
            {
                type: 'Length',
                params: {
                    min: 2,
                },
            },
        ],
    },

    City: {
        constraints: [
            {
                type: 'City',
            },
        ],
    },

    Description: {
        constraints: [
            {
                type: 'NotBlank',
            },
        ],
    },

    Date: {
        constraints: [
            {
                type: 'Date',
            },
        ],
    },

    Email: {
        constraints: [
            {
                type: 'NotPhoneEmail',
            },
            {
                type: 'Email',
            },
        ],
    },

    Frequency: {
        constraints: [
            {
                type: 'Enum',
                params: {
                    value: 'Daily Weekly Monthly',
                },
            },
        ],
    },

    Id: {
        constraints: [
            {
                type: 'AlphaNumeric',
            },
            {
                type: 'Length',
                params: {
                    min: 6,
                },
            },
            {
                type: 'Numbers',
                params: {
                    min: 1,
                },
            },
        ],
    },

    IdentificationCode: {
        constraints: [
            {
                type: 'Integer',
            },
            {
                type: 'Length',
                params: {
                    max: 8,
                },
            },
        ],
    },

    List: {
        constraints: [],
    },

    Money: {
        constraints: [
            {
                type: 'Money',
            },
        ],
    },

    Noop: {
        constraints: [],
    },

    OnOff: {
        constraints: [
            {
                type: 'Boolean',
            },
        ],
    },

    Password: {
        constraints: [
            {
                type: 'Length',
                params: {
                    min: 8,
                    max: 32,
                },
            },
            {
                type: 'Numbers',
                params: {
                    min: 1,
                },
            },
            {
                type: 'Characters',
                params: {
                    min: 1,
                },
            },
            {
                type: 'Pattern',
                params: {
                    regex: "/^[\\w!@#$%^*()_+\\-=\\[\\]{};':\\|,.\\/?~]*$/", // jshint ignore:line
                },
            },
            {
                type: 'NonConsecutiveAlphaNumerics',
                params: {
                    maxSequential: 3,
                },
            },
            {
                type: 'NonRepeatingAlphaNumerics',
                params: {
                    maxRepeating: 2,
                },
            },
        ],
    },

    Payee: {
        constraints: [
            {
                type: 'Length',
                params: {
                    max: 30,
                },
            },
        ],
    },

    Phone: {
        constraints: [
            {
                type: 'PhoneNorthAmerica',
            },
            {
                type: 'Length',
                params: {
                    min: 10,
                    max: 12,
                },
            },
        ],
    },

    PostalCode: {
        constraints: [
            {
                type: 'PostalCode',
            },
        ],
    },

    // BlueJS-529
    ProspectApplicantId: {
        constraints: [
            {
                type: 'AlphaNumeric',
            },
            {
                type: 'Length',
                params: {
                    min: 6,
                },
            },
        ],
    },

    Rate: {
        constraints: [
            {
                type: 'Digits',
                params: {
                    integer: 0,
                    fraction: 2,
                },
            },
            {
                type: 'Range',
                params: {
                    min: 0,
                    max: 0.99,
                },
            },
        ],
    },

    RoutingNumber: {
        constraints: [
            {
                type: 'RoutingNumber',
            },
        ],
    },

    // BLUEJS-556
    RSAToken: {
        constraints: [
            {
                type: 'Numeric',
            },
            {
                type: 'Length',
                params: {
                    min: 6,
                    max: 35,
                },
            },
        ],
    },

    SimpleUserId: {
        constraints: [
            {
                type: 'NonRepeatingSequence',
            },
        ],
    },

    TaxpayerIdentification: {
        constraints: [
            {
                type: 'Pattern',
                params: {
                    regex: '^(\\d{3}-\\d{2}-\\d{4}|\\d{9}|\\d{2}-\\d{7}|XXX-XX-XXXX|XX-XXXXXXX)$',
                },
            },
        ],
    },

    UserId: {
        constraints: [
            {
                type: 'AlphaNumeric',
            },
            {
                type: 'Length',
                params: {
                    min: 8,
                    max: 32,
                },
            },
            {
                type: 'Characters',
                params: {
                    min: 1,
                },
            },
            {
                type: 'Numbers',
                params: {
                    min: 1,
                },
            },
        ],
    },

    UserSecurityCode: {
        constraints: [
            {
                type: 'AlphaNumeric',
            },
            {
                type: 'Length',
                params: {
                    min: 8,
                    max: 32,
                },
            },
            {
                type: 'Characters',
                params: {
                    min: 1,
                },
            },
            {
                type: 'Numbers',
                params: {
                    min: 1,
                },
            },
        ],
    },

    ZipCode: {
        constraints: [
            {
                type: 'ZipCode',
            },
        ],
    },

    ZipCodeExtension: {
        constraints: [
            {
                type: 'ZipCodeExtension',
            },
        ],
    },
};

export default standardTypes;
