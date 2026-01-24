declare const types: {
    AccountNumber: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
                max: number;
            };
        })[];
    };
    AccountMaskNumber: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
                max?: undefined;
                regex?: undefined;
            };
        } | {
            type: string;
            params: {
                min: number;
                max: number;
                regex?: undefined;
            };
        } | {
            type: string;
            params: {
                regex: string;
                min?: undefined;
                max?: undefined;
            };
        })[];
    };
    AddressLine: {
        constraints: {
            type: string;
        }[];
    };
    AlertsProfileNickname: {
        constraints: {
            type: string;
            params: {
                regex: string;
            };
        }[];
    };
    Category: {
        constraints: {
            type: string;
            params: {
                min: number;
            };
        }[];
    };
    City: {
        constraints: {
            type: string;
        }[];
    };
    Description: {
        constraints: {
            type: string;
        }[];
    };
    Date: {
        constraints: {
            type: string;
        }[];
    };
    Email: {
        constraints: {
            type: string;
        }[];
    };
    Frequency: {
        constraints: {
            type: string;
            params: {
                value: string;
            };
        }[];
    };
    Id: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
            };
        })[];
    };
    IdentificationCode: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                max: number;
            };
        })[];
    };
    List: {
        constraints: any[];
    };
    Money: {
        constraints: {
            type: string;
        }[];
    };
    Noop: {
        constraints: any[];
    };
    OnOff: {
        constraints: {
            type: string;
        }[];
    };
    Password: {
        constraints: ({
            type: string;
            params: {
                min: number;
                max: number;
                regex?: undefined;
                maxSeqential?: undefined;
                maxRepeating?: undefined;
            };
        } | {
            type: string;
            params: {
                min: number;
                max?: undefined;
                regex?: undefined;
                maxSeqential?: undefined;
                maxRepeating?: undefined;
            };
        } | {
            type: string;
            params: {
                regex: string;
                min?: undefined;
                max?: undefined;
                maxSeqential?: undefined;
                maxRepeating?: undefined;
            };
        } | {
            type: string;
            params: {
                maxSeqential: number;
                min?: undefined;
                max?: undefined;
                regex?: undefined;
                maxRepeating?: undefined;
            };
        } | {
            type: string;
            params: {
                maxRepeating: number;
                min?: undefined;
                max?: undefined;
                regex?: undefined;
                maxSeqential?: undefined;
            };
        })[];
    };
    Payee: {
        constraints: {
            type: string;
            params: {
                max: number;
            };
        }[];
    };
    Phone: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
                max: number;
            };
        })[];
    };
    PostalCode: {
        constraints: {
            type: string;
        }[];
    };
    ProspectApplicantId: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
            };
        })[];
    };
    Rate: {
        constraints: ({
            type: string;
            params: {
                integer: number;
                fraction: number;
                min?: undefined;
                max?: undefined;
            };
        } | {
            type: string;
            params: {
                min: number;
                max: number;
                integer?: undefined;
                fraction?: undefined;
            };
        })[];
    };
    RoutingNumber: {
        constraints: {
            type: string;
        }[];
    };
    RSAToken: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
                max: number;
            };
        })[];
    };
    SimpleUserId: {
        constraints: {
            type: string;
        }[];
    };
    TaxpayerIdentification: {
        constraints: {
            type: string;
            params: {
                regex: string;
            };
        }[];
    };
    UserId: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
                max: number;
            };
        } | {
            type: string;
            params: {
                min: number;
                max?: undefined;
            };
        })[];
    };
    UserSecurityCode: {
        constraints: ({
            type: string;
            params?: undefined;
        } | {
            type: string;
            params: {
                min: number;
                max: number;
            };
        } | {
            type: string;
            params: {
                min: number;
                max?: undefined;
            };
        })[];
    };
    ZipCode: {
        constraints: {
            type: string;
        }[];
    };
    ZipCodeExtension: {
        constraints: {
            type: string;
        }[];
    };
};
export default types;
//# sourceMappingURL=types.d.ts.map