[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [response-statuses](../README.md) / OK

# Variable: OK

> `const` **OK**: [`default`](../../response-status/classes/default.md)

The request has succeeded. The meaning of the success depends on the HTTP method:
* `GET`: The resource has been fetched and is transmitted in the message body.
* `HEAD`: The entity headers are in the message body.
* `PUT` or `POST`: The resource describing the result of the action is transmitted in the message body.
* `TRACE`: The message body contains the request message as received by the server.
