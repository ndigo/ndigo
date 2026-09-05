[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-http/src](../../../README.md) / [ResponseStatuses](../README.md) / OK

# Variable: OK

> `const` **OK**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

Defined in: [packages/blue-http/src/response-statuses.ts:46](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-statuses.ts#lines-46)

The request has succeeded. The meaning of the success depends on the HTTP method:
* `GET`: The resource has been fetched and is transmitted in the message body.
* `HEAD`: The entity headers are in the message body.
* `PUT` or `POST`: The resource describing the result of the action is transmitted in the message body.
* `TRACE`: The message body contains the request message as received by the server.
