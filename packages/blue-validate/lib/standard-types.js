/**
 * @author Jeff Rose
 */
/**
 * @namespace module:validate.types
 */
/**
 * @typedef BusinessType
 * @property {external:Array} constraints
 */
const standardTypes = {
    // Always include constraints for each spec type
    // As per Jon Spy 6/26 len varies by LoB/Acct-Type; details pending from Enterprise
    // CIG zero-pads to 23 before writing to Profile after triggered online/offline CAMM call
    /**
     * @member {BusinessType} module:validate.types.AccountNumber
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
                    maxSeqential: 3,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmQtdHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RhbmRhcmQtdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVILE1BQU0sYUFBYSxHQUFHO0lBQ2xCLGdEQUFnRDtJQUVoRCxtRkFBbUY7SUFDbkYseUZBQXlGO0lBQ3pGOztPQUVHO0lBQ0gsYUFBYSxFQUFFO1FBQ1gsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLGNBQWM7YUFDdkI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7b0JBQ04sR0FBRyxFQUFFLEVBQUU7aUJBQ1Y7YUFDSjtTQUNKO0tBQ0o7SUFFRCxxRUFBcUU7SUFDckUsaUJBQWlCLEVBQUU7UUFDZixXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsY0FBYzthQUN2QjtZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsQ0FBQztpQkFDVDthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxDQUFDO29CQUNOLEdBQUcsRUFBRSxDQUFDO2lCQUNUO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsU0FBUztnQkFDZixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLGFBQWE7aUJBQ3ZCO2FBQ0o7U0FDSjtLQUNKO0lBRUQsV0FBVyxFQUFFO1FBQ1QsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLGFBQWE7YUFDdEI7U0FDSjtLQUNKO0lBRUQscUJBQXFCLEVBQUU7UUFDbkIsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxvQkFBb0I7aUJBQzlCO2FB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