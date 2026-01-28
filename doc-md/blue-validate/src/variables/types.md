[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / types

# Variable: types

> `const` **types**: `object`

Defined in: packages/blue-validate/src/types.ts:11

## Type Declaration

### AccountNumber

> **AccountNumber**: `object`

#### AccountNumber.constraints

> **constraints**: (\{ `type`: `string`; `params?`: `undefined`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; `max`: `number`; \}; \})[]

### AccountMaskNumber

> **AccountMaskNumber**: `object`

#### AccountMaskNumber.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; `max?`: `undefined`; `regex?`: `undefined`; \}; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; `max`: `number`; `regex?`: `undefined`; \}; \} \| \{ `type`: `string`; `params`: \{ `min?`: `undefined`; `max?`: `undefined`; `regex`: `string`; \}; \})[]

### AddressLine

> **AddressLine**: `object`

#### AddressLine.constraints

> **constraints**: `object`[]

### AlertsProfileNickname

> **AlertsProfileNickname**: `object`

#### AlertsProfileNickname.constraints

> **constraints**: `object`[]

### Category

> **Category**: `object`

#### Category.constraints

> **constraints**: `object`[]

### City

> **City**: `object`

#### City.constraints

> **constraints**: `object`[]

### Description

> **Description**: `object`

#### Description.constraints

> **constraints**: `object`[]

### Date

> **Date**: `object`

#### Date.constraints

> **constraints**: `object`[]

### Email

> **Email**: `object`

#### Email.constraints

> **constraints**: `object`[]

### Frequency

> **Frequency**: `object`

#### Frequency.constraints

> **constraints**: `object`[]

### Id

> **Id**: `object`

#### Id.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; \}; \})[]

### IdentificationCode

> **IdentificationCode**: `object`

#### IdentificationCode.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `max`: `number`; \}; \})[]

### List

> **List**: `object`

#### List.constraints

> **constraints**: `any`[] = `[]`

### Money

> **Money**: `object`

#### Money.constraints

> **constraints**: `object`[]

### Noop

> **Noop**: `object`

#### Noop.constraints

> **constraints**: `any`[] = `[]`

### OnOff

> **OnOff**: `object`

#### OnOff.constraints

> **constraints**: `object`[]

### Password

> **Password**: `object`

#### Password.constraints

> **constraints**: (\{ `type`: `string`; `params`: \{ `regex?`: `undefined`; `min`: `number`; `max`: `number`; `maxSeqential?`: `undefined`; `maxRepeating?`: `undefined`; \}; \} \| \{ `type`: `string`; `params`: \{ `max?`: `undefined`; `regex?`: `undefined`; `min`: `number`; `maxSeqential?`: `undefined`; `maxRepeating?`: `undefined`; \}; \} \| \{ `type`: `string`; `params`: \{ `min?`: `undefined`; `max?`: `undefined`; `regex`: `string`; `maxSeqential?`: `undefined`; `maxRepeating?`: `undefined`; \}; \} \| \{ `type`: `string`; `params`: \{ `min?`: `undefined`; `max?`: `undefined`; `regex?`: `undefined`; `maxSeqential`: `number`; `maxRepeating?`: `undefined`; \}; \} \| \{ `type`: `string`; `params`: \{ `min?`: `undefined`; `max?`: `undefined`; `regex?`: `undefined`; `maxSeqential?`: `undefined`; `maxRepeating`: `number`; \}; \})[]

### Payee

> **Payee**: `object`

#### Payee.constraints

> **constraints**: `object`[]

### Phone

> **Phone**: `object`

#### Phone.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; `max`: `number`; \}; \})[]

### PostalCode

> **PostalCode**: `object`

#### PostalCode.constraints

> **constraints**: `object`[]

### ProspectApplicantId

> **ProspectApplicantId**: `object`

#### ProspectApplicantId.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; \}; \})[]

### Rate

> **Rate**: `object`

#### Rate.constraints

> **constraints**: (\{ `type`: `string`; `params`: \{ `min?`: `undefined`; `max?`: `undefined`; `integer`: `number`; `fraction`: `number`; \}; \} \| \{ `type`: `string`; `params`: \{ `integer?`: `undefined`; `fraction?`: `undefined`; `min`: `number`; `max`: `number`; \}; \})[]

### RoutingNumber

> **RoutingNumber**: `object`

#### RoutingNumber.constraints

> **constraints**: `object`[]

### RSAToken

> **RSAToken**: `object`

#### RSAToken.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; `max`: `number`; \}; \})[]

### SimpleUserId

> **SimpleUserId**: `object`

#### SimpleUserId.constraints

> **constraints**: `object`[]

### TaxpayerIdentification

> **TaxpayerIdentification**: `object`

#### TaxpayerIdentification.constraints

> **constraints**: `object`[]

### UserId

> **UserId**: `object`

#### UserId.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; `max`: `number`; \}; \} \| \{ `type`: `string`; `params`: \{ `max?`: `undefined`; `min`: `number`; \}; \})[]

### UserSecurityCode

> **UserSecurityCode**: `object`

#### UserSecurityCode.constraints

> **constraints**: (\{ `params?`: `undefined`; `type`: `string`; \} \| \{ `type`: `string`; `params`: \{ `min`: `number`; `max`: `number`; \}; \} \| \{ `type`: `string`; `params`: \{ `max?`: `undefined`; `min`: `number`; \}; \})[]

### ZipCode

> **ZipCode**: `object`

#### ZipCode.constraints

> **constraints**: `object`[]

### ZipCodeExtension

> **ZipCodeExtension**: `object`

#### ZipCodeExtension.constraints

> **constraints**: `object`[]
