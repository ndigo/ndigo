[**@blue/http v0.0.1**](../../../../README.md)

***

[@blue/http](../../../../README.md) / [blue-http](../../../README.md) / [blue-http](../README.md) / REQUEST\_TIMEOUT

# Variable: REQUEST\_TIMEOUT

> `const` **REQUEST\_TIMEOUT**: [`ResponseStatus`](../../../classes/ResponseStatus.md)

This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers, like Chrome, Firefox 27+, or IE9, use HTTP pre-connection mechanisms to speed up surfing. Also note that some servers merely shut down the connection without sending this message.
