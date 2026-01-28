/**
 * @author Jeff Rose
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmQtdHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RhbmRhcmQtdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVILE1BQU0sYUFBYSxHQUFHO0lBQ2xCLGdEQUFnRDtJQUVoRCxtRkFBbUY7SUFDbkYseUZBQXlGO0lBQ3pGO09BQ0c7SUFDSCxhQUFhLEVBQUU7UUFDWCxXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsY0FBYzthQUN2QjtZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsQ0FBQztvQkFDTixHQUFHLEVBQUUsRUFBRTtpQkFDVjthQUNKO1NBQ0o7S0FDSjtJQUVELHFFQUFxRTtJQUNyRSxpQkFBaUIsRUFBRTtRQUNmLFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxjQUFjO2FBQ3ZCO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxDQUFDO2lCQUNUO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsU0FBUztnQkFDZixNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7b0JBQ04sR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsYUFBYTtpQkFDdkI7YUFDSjtTQUNKO0tBQ0o7SUFFRCxXQUFXLEVBQUU7UUFDVCxXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsYUFBYTthQUN0QjtTQUNKO0tBQ0o7SUFFRCxxQkFBcUIsRUFBRTtRQUNuQixXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsU0FBUztnQkFDZixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLG9CQUFvQjtpQkFDOUI7YUFDSjtTQUNKO0tBQ0o7SUFFRCxRQUFRLEVBQUU7UUFDTixXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtTQUNKO0tBQ0o7SUFFRCxJQUFJLEVBQUU7UUFDRixXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsTUFBTTthQUNmO1NBQ0o7S0FDSjtJQUVELFdBQVcsRUFBRTtRQUNULFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxVQUFVO2FBQ25CO1NBQ0o7S0FDSjtJQUVELElBQUksRUFBRTtRQUNGLFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxNQUFNO2FBQ2Y7U0FDSjtLQUNKO0lBRUQsS0FBSyxFQUFFO1FBQ0gsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLGVBQWU7YUFDeEI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsT0FBTzthQUNoQjtTQUNKO0tBQ0o7SUFFRCxTQUFTLEVBQUU7UUFDUCxXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsTUFBTTtnQkFDWixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLHNCQUFzQjtpQkFDaEM7YUFDSjtTQUNKO0tBQ0o7SUFFRCxFQUFFLEVBQUU7UUFDQSxXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsY0FBYzthQUN2QjtZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsQ0FBQztpQkFDVDthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxDQUFDO2lCQUNUO2FBQ0o7U0FDSjtLQUNKO0lBRUQsa0JBQWtCLEVBQUU7UUFDaEIsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7YUFDbEI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtTQUNKO0tBQ0o7SUFFRCxJQUFJLEVBQUU7UUFDRixXQUFXLEVBQUUsRUFBRTtLQUNsQjtJQUVELEtBQUssRUFBRTtRQUNILFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxPQUFPO2FBQ2hCO1NBQ0o7S0FDSjtJQUVELElBQUksRUFBRTtRQUNGLFdBQVcsRUFBRSxFQUFFO0tBQ2xCO0lBRUQsS0FBSyxFQUFFO1FBQ0gsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7YUFDbEI7U0FDSjtLQUNKO0lBRUQsUUFBUSxFQUFFO1FBQ04sV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsTUFBTSxFQUFFO29CQUNKLEdBQUcsRUFBRSxDQUFDO29CQUNOLEdBQUcsRUFBRSxFQUFFO2lCQUNWO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsU0FBUztnQkFDZixNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxZQUFZO2dCQUNsQixNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsZ0RBQWdELEVBQUUscUJBQXFCO2lCQUNqRjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLDZCQUE2QjtnQkFDbkMsTUFBTSxFQUFFO29CQUNKLFlBQVksRUFBRSxDQUFDO2lCQUNsQjthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLDJCQUEyQjtnQkFDakMsTUFBTSxFQUFFO29CQUNKLFlBQVksRUFBRSxDQUFDO2lCQUNsQjthQUNKO1NBQ0o7S0FDSjtJQUVELEtBQUssRUFBRTtRQUNILFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsRUFBRTtpQkFDVjthQUNKO1NBQ0o7S0FDSjtJQUVELEtBQUssRUFBRTtRQUNILFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxtQkFBbUI7YUFDNUI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLEVBQUU7b0JBQ1AsR0FBRyxFQUFFLEVBQUU7aUJBQ1Y7YUFDSjtTQUNKO0tBQ0o7SUFFRCxVQUFVLEVBQUU7UUFDUixXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsWUFBWTthQUNyQjtTQUNKO0tBQ0o7SUFFRCxhQUFhO0lBQ2IsbUJBQW1CLEVBQUU7UUFDakIsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLGNBQWM7YUFDdkI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtTQUNKO0tBQ0o7SUFFRCxJQUFJLEVBQUU7UUFDRixXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osT0FBTyxFQUFFLENBQUM7b0JBQ1YsUUFBUSxFQUFFLENBQUM7aUJBQ2Q7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxPQUFPO2dCQUNiLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsQ0FBQztvQkFDTixHQUFHLEVBQUUsSUFBSTtpQkFDWjthQUNKO1NBQ0o7S0FDSjtJQUVELGFBQWEsRUFBRTtRQUNYLFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxlQUFlO2FBQ3hCO1NBQ0o7S0FDSjtJQUVELGFBQWE7SUFDYixRQUFRLEVBQUU7UUFDTixXQUFXLEVBQUU7WUFDVDtnQkFDSSxJQUFJLEVBQUUsU0FBUzthQUNsQjtZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsQ0FBQztvQkFDTixHQUFHLEVBQUUsRUFBRTtpQkFDVjthQUNKO1NBQ0o7S0FDSjtJQUVELFlBQVksRUFBRTtRQUNWLFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxzQkFBc0I7YUFDL0I7U0FDSjtLQUNKO0lBRUQsc0JBQXNCLEVBQUU7UUFDcEIsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxzRUFBc0U7aUJBQ2hGO2FBQ0o7U0FDSjtLQUNKO0lBRUQsTUFBTSxFQUFFO1FBQ0osV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLGNBQWM7YUFDdkI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7b0JBQ04sR0FBRyxFQUFFLEVBQUU7aUJBQ1Y7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxZQUFZO2dCQUNsQixNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsQ0FBQztpQkFDVDthQUNKO1NBQ0o7S0FDSjtJQUVELGdCQUFnQixFQUFFO1FBQ2QsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLGNBQWM7YUFDdkI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7b0JBQ04sR0FBRyxFQUFFLEVBQUU7aUJBQ1Y7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxZQUFZO2dCQUNsQixNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLE1BQU0sRUFBRTtvQkFDSixHQUFHLEVBQUUsQ0FBQztpQkFDVDthQUNKO1NBQ0o7S0FDSjtJQUVELE9BQU8sRUFBRTtRQUNMLFdBQVcsRUFBRTtZQUNUO2dCQUNJLElBQUksRUFBRSxTQUFTO2FBQ2xCO1NBQ0o7S0FDSjtJQUVELGdCQUFnQixFQUFFO1FBQ2QsV0FBVyxFQUFFO1lBQ1Q7Z0JBQ0ksSUFBSSxFQUFFLGtCQUFrQjthQUMzQjtTQUNKO0tBQ0o7Q0FDSixDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==