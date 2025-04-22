/**
 * Hypertext Transfer Protocol (HTTP) response status codes.
 * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes}
 * @author Zach Ayers
 */
export const statusCodes = <
  Record<
    AvailableStatusCodes,
    { code: number; description: string; name: string }
  >
>{
  CONTINUE: {
    code: 100,
    name: "CONTINUE",
    description: `The server has received the request headers and the client should proceed to send the request body (in the case of a request for which a body needs to be sent; for example, a POST request). Sending a large request body to a server after a request has been rejected for inappropriate headers would be inefficient. To have a server check the request's headers, a client must send Expect: 100-continue as a header in its initial request and receive a 100 Continue status code in response before sending the body. The response 417 Expectation Failed indicates the request should not be continued.`,
  },
  SWITCHING_PROTOCOLS: {
    code: 101,
    name: "SWITCHING_PROTOCOLS",
    description:
      "The requester has asked the server to switch protocols and the server has agreed to do so.",
  },
  PROCESSING: {
    code: 102,
    name: "PROCESSING",
    description:
      "A WebDAV request may contain many sub-requests involving file operations, requiring a long time to complete the request. This code indicates that the server has received and is processing the request, but no response is available yet. This prevents the client from timing out and assuming the request was lost.",
  },
  OK: {
    code: 200,
    name: "OK",
    description:
      "Standard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request, the response will contain an entity describing or containing the result of the action.",
  },
  CREATED: {
    code: 201,
    name: "CREATED",
    description:
      "The request has been fulfilled, resulting in the creation of a new resource.",
  },
  ACCEPTED: {
    code: 202,
    name: "ACCEPTED",
    description:
      "The request has been accepted for processing, but the processing has not been completed. The request might or might not be eventually acted upon, and may be disallowed when processing occurs.",
  },
  NON_AUTHORITATIVE_INFORMATION: {
    code: 203,
    name: "NON_AUTHORITATIVE_INFORMATION",
    description:
      "SINCE HTTP/1.1: The server is a transforming proxy that received a 200 OK from its origin, but is returning a modified version of the origin's response.",
  },
  NO_CONTENT: {
    code: 204,
    name: "NO_CONTENT",
    description:
      "The server successfully processed the request and is not returning any content.",
  },
  RESET_CONTENT: {
    code: 205,
    name: "RESET_CONTENT",
    description:
      "The server successfully processed the request, but is not returning any content. Unlike a 204 response, this response requires that the requester reset the document view.",
  },
  PARTIAL_CONTENT: {
    code: 206,
    name: "PARTIAL_CONTENT",
    description:
      "The server is delivering only part of the resource (byte serving) due to a range header sent by the client. The range header is used by HTTP clients to enable resuming of interrupted downloads, or split a download into multiple simultaneous streams.",
  },
  MULTI_STATUS: {
    code: 207,
    name: "MULTI_STATUS",
    description:
      "The message body that follows is an XML message and can contain a number of separate response codes, depending on how many sub-requests were made.",
  },
  ALREADY_REPORTED: {
    code: 208,
    name: "ALREADY_REPORTED",
    description:
      "The members of a DAV binding have already been enumerated in a preceding part of the (multi-status) response, and are not being included again.",
  },
  IM_USED: {
    code: 226,
    name: "IM_USED",
    description:
      "The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.",
  },
  MULTIPLE_CHOICES: {
    code: 300,
    name: "MULTIPLE_CHOICES",
    description:
      "Indicates multiple options for the resource from which the client may choose (via agent-driven content negotiation). For example, this code could be used to present multiple video format options, to list files with different filename extensions, or to suggest word-sense disambiguation.",
  },
  MOVED_PERMANENTLY: {
    code: 301,
    description:
      "This and all future requests should be directed to the given URI.",
    name: "MOVED_PERMANENTLY",
  },
  FOUND: {
    code: 302,
    name: "FOUND",
    description:
      'This is an example of industry practice contradicting the standard. The HTTP/1.0 specification (RFC 1945) required the client to perform a temporary redirect (the original describing phrase was "Moved Temporarily"), but popular browsers implemented 302 with the functionality of a 303 See Other. Therefore, HTTP/1.1 added status codes 303 and 307 to distinguish between the two behaviours. However, some Web applications and frameworks use the 302 status code as if it were the 303.',
  },
  SEE_OTHER: {
    code: 303,
    name: "SEE_OTHER",
    description:
      "SINCE HTTP/1.1 The response to the request can be found under another URI using a GET method. When received in response to a POST (or PUT/DELETE), the client should presume that the server has received the data and should issue a redirect with a separate GET message.",
  },
  NOT_MODIFIED: {
    code: 304,
    name: "NOT_MODIFIED",
    description:
      "Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match. In such case, there is no need to retransmit the resource since the client still has a previously-downloaded copy.",
  },
  USE_PROXY: {
    code: 305,
    name: "USE_PROXY",
    description:
      "SINCE HTTP/1.1 The requested resource is available only through a proxy, the address for which is provided in the response. Many HTTP clients (such as Mozilla and Internet Explorer) do not correctly handle responses with this status code, primarily for security reasons.",
  },
  SWITCH_PROXY: {
    code: 306,
    name: "SWITCH_PROXY",
    description:
      'No longer used. Originally meant "Subsequent requests should use the specified proxy."',
  },
  TEMPORARY_REDIRECT: {
    code: 307,
    name: "TEMPORARY_REDIRECT",
    description:
      "SINCE HTTP/1.1: In this case, the request should be repeated with another URI; however, future requests should still use the original URI. In contrast to how 302 was historically implemented, the request method is not allowed to be changed when reissuing the original request. For example, a POST request should be repeated using another POST request.",
  },
  PERMANENT_REDIRECT: {
    code: 308,
    name: "PERMANENT_REDIRECT",
    description:
      "The request and all future requests should be repeated using another URI. 307 and 308 parallel the behaviors of 302 and 301, but do not allow the HTTP method to change. So, for example, submitting a form to a permanently redirected resource may continue smoothly.",
  },
  BAD_REQUEST: {
    code: 400,
    name: "BAD_REQUEST",
    description:
      "The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, too large size, invalid request message framing, or deceptive request routing).",
  },
  UNAUTHORIZED: {
    code: 401,
    name: "UNAUTHORIZED",
    description:
      'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource. See Basic access authentication and Digest access authentication. 401 semantically means "unauthenticated",i.e. the user does not have the necessary credentials.',
  },
  PAYMENT_REQUIRED: {
    code: 402,
    name: "PAYMENT_REQUIRED",
    description:
      "Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micro payment scheme, but that has not happened, and this code is not usually used. Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.",
  },
  FORBIDDEN: {
    code: 403,
    name: "FORBIDDEN",
    description:
      "The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource.",
  },
  NOT_FOUND: {
    code: 404,
    name: "NOT_FOUND",
    description:
      "The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible.",
  },
  METHOD_NOT_ALLOWED: {
    code: 405,
    name: "METHOD_NOT_ALLOWED",
    description:
      "A request method is not supported for the requested resource; for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.",
  },
  NOT_ACCEPTABLE: {
    code: 406,
    name: "NOT_ACCEPTABLE",
    description:
      "The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.",
  },
  PROXY_AUTHENTICATION_REQUIRED: {
    code: 407,
    description: "The client must first authRealm itself with the proxy.",
    name: "PROXY_AUTHENTICATION_REQUIRED",
  },
  REQUEST_TIMEOUT: {
    code: 408,
    name: "REQUEST_TIMEOUT",
    description:
      'The server timed out waiting for the request. According to HTTP specifications: "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time."',
  },
  CONFLICT: {
    code: 409,
    name: "CONFLICT",
    description:
      "Indicates that the request could not be processed because of conflict in the request, such as an edit conflict between multiple simultaneous updates.",
  },
  GONE: {
    code: 410,
    name: "GONE",
    description: `Indicates that the resource requested is no longer available and will not be available again. This should be used when a resource has been intentionally removed and the resource should be purged. Upon receiving a 410 status code, the client should not request the resource in the future. Clients such as search engines should remove the resource from their indices. Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead.`,
  },
  LENGTH_REQUIRED: {
    code: 411,
    name: "LENGTH_REQUIRED",
    description:
      "The request did not specify the length of its content, which is required by the requested resource.",
  },
  PRECONDITION_FAILED: {
    code: 412,
    name: "PRECONDITION_FAILED",
    description:
      "The server does not meet one of the preconditions that the requester put on the request.",
  },
  PAYLOAD_TOO_LARGE: {
    code: 413,
    name: "PAYLOAD_TOO_LARGE",
    description:
      'The request is larger than the server is willing or able to process. Previously called "Request Entity Too Large".',
  },
  URI_TOO_LONG: {
    code: 414,
    name: "URI_TOO_LONG",
    description:
      'The URI provided was too long for the server to process. Often the result of too much data being encoded as a query-string of a GET request, in which case it should be converted to a POST request. Called "Request-URI Too Long" previously."',
  },
  UNSUPPORTED_MEDIA_TYPE: {
    code: 415,
    name: "UNSUPPORTED_MEDIA_TYPE",
    description:
      "The request entity has a media type which the server or resource does not support. For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format.",
  },
  RANGE_NOT_SATISFIABLE: {
    code: 416,
    name: "RANGE_NOT_SATISFIABLE",
    description:
      'The client has asked for a portion of the file (byte serving), but the server cannot supply that portion. For example, if the client asked for a part of the file that lies beyond the end of the file. Called "Requested Range Not Satisfiable" previously.',
  },
  EXPECTATION_FAILED: {
    code: 417,
    name: "EXPECTATION_FAILED",
    description:
      "The server cannot meet the requirements of the Expect request-header field.",
  },
  I_AM_A_TEAPOT: {
    code: 418,
    name: "I_AM_A_TEAPOT",
    description:
      "This code was defined in 1998 as one of the traditional IETF April Fools jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers. The RFC specifies this code should be returned by teapots requested to brew coffee. This HTTP status is used as an Easter egg in some websites, including Google.com.",
  },
  MISDIRECTED_REQUEST: {
    code: 421,
    name: "MISDIRECTED_REQUEST",
    description:
      "The request was directed at a server that is not able to produce a response (for example because a connection reuse).",
  },
  UNPROCESSABLE_ENTITY: {
    code: 422,
    name: "UNPROCESSABLE_ENTITY",
    description:
      "The request was well-formed but was unable to be followed due to semantic errors.",
  },
  LOCKED: {
    code: 423,
    description: "The resource that is being accessed is locked.",
    name: "LOCKED",
  },
  FAILED_DEPENDENCY: {
    code: 424,
    name: "FAILED_DEPENDENCY",
    description:
      "The request failed due to failure of a previous request (e.g., a PROPPATCH).",
  },
  UPGRADE_REQUIRED: {
    code: 426,
    name: "UPGRADE_REQUIRED",
    description:
      "The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field.",
  },
  PRECONDITION_REQUIRED: {
    code: 428,
    name: "PRECONDITION_REQUIRED",
    description:
      'The origin server requires the request to be conditional. Intended to prevent the "lost update" problem, where a client GETs a resource\'s state, modifies it, and PUTs it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict."',
  },
  TOO_MANY_REQUESTS: {
    code: 429,
    name: "TOO_MANY_REQUESTS",
    description:
      "The user has sent too many requests in a given amount of time. Intended for use with rate-limiting schemes.",
  },
  REQUEST_HEADER_FIELDS_TOO_LARGE: {
    code: 431,
    name: "REQUEST_HEADER_FIELDS_TOO_LARGE",
    description:
      "The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.",
  },
  UNAVAILABLE_FOR_LEGAL_REASONS: {
    code: 451,
    name: "UNAVAILABLE_FOR_LEGAL_REASONS",
    description:
      "A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource. The code `451` was chosen as a reference to the novel Fahrenheit 451.",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    name: "INTERNAL_SERVER_ERROR",
    description:
      "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.",
  },
  NOT_IMPLEMENTED: {
    code: 501,
    name: "NOT_IMPLEMENTED",
    description:
      "The server either does not recognize the request method, or it lacks the ability to fulfill the request. Usually this implies future availability (e.g., a new feature of a web-service API).",
  },
  BAD_GATEWAY: {
    code: 502,
    name: "BAD_GATEWAY",
    description:
      "The server was acting as a gateway or proxy and received an invalid response from the upstream server.",
  },
  SERVICE_UNAVAILABLE: {
    code: 503,
    name: "SERVICE_UNAVAILABLE",
    description:
      "The server is currently unavailable (because it is overloaded or down for maintenance). Generally, this is a temporary state.",
  },
  GATEWAY_TIMEOUT: {
    code: 504,
    name: "GATEWAY_TIMEOUT",
    description:
      "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.",
  },
  HTTP_VERSION_NOT_SUPPORTED: {
    code: 505,
    name: "HTTP_VERSION_NOT_SUPPORTED",
    description:
      "The server does not support the HTTP protocol version used in the request.",
  },
  VARIANT_ALSO_NEGOTIATES: {
    code: 506,
    name: "VARIANT_ALSO_NEGOTIATES",
    description:
      "Transparent content negotiation for the request results in a circular reference.",
  },
  INSUFFICIENT_STORAGE: {
    code: 507,
    name: "INSUFFICIENT_STORAGE",
    description:
      "The server is unable to store the representation needed to complete the request.",
  },
  LOOP_DETECTED: {
    code: 508,
    description:
      "The server detected an infinite loop while processing the request.",
    name: "LOOP_DETECTED",
  },
  NOT_EXTENDED: {
    code: 510,
    name: "NOT_EXTENDED",
    description:
      "Further extensions to the request are required for the server to fulfill it.",
  },
  NETWORK_AUTHENTICATION_REQUIRED: {
    code: 511,
    name: "NETWORK_AUTHENTICATION_REQUIRED",
    description:
      'The client needs to authRealm to gain network access. Intended for use by intercepting proxies used to control access to the network (e.g., "captive portals" used to require agreement to Terms of Service before granting full Internet access via a Wi-Fi hotspot).',
  },
};

type AvailableStatusCodes =
  | "CONTINUE"
  | "SWITCHING_PROTOCOLS"
  | "PROCESSING"
  | "OK"
  | "CREATED"
  | "ACCEPTED"
  | "NON_AUTHORITATIVE_INFORMATION"
  | "NO_CONTENT"
  | "RESET_CONTENT"
  | "PARTIAL_CONTENT"
  | "MULTI_STATUS"
  | "ALREADY_REPORTED"
  | "IM_USED"
  | "MULTIPLE_CHOICES"
  | "MOVED_PERMANENTLY"
  | "FOUND"
  | "SEE_OTHER"
  | "NOT_MODIFIED"
  | "USE_PROXY"
  | "SWITCH_PROXY"
  | "TEMPORARY_REDIRECT"
  | "PERMANENT_REDIRECT"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "PAYMENT_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "NOT_ACCEPTABLE"
  | "PROXY_AUTHENTICATION_REQUIRED"
  | "REQUEST_TIMEOUT"
  | "CONFLICT"
  | "GONE"
  | "LENGTH_REQUIRED"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "URI_TOO_LONG"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RANGE_NOT_SATISFIABLE"
  | "EXPECTATION_FAILED"
  | "I_AM_A_TEAPOT"
  | "MISDIRECTED_REQUEST"
  | "UNPROCESSABLE_ENTITY"
  | "LOCKED"
  | "FAILED_DEPENDENCY"
  | "UPGRADE_REQUIRED"
  | "PRECONDITION_REQUIRED"
  | "TOO_MANY_REQUESTS"
  | "REQUEST_HEADER_FIELDS_TOO_LARGE"
  | "UNAVAILABLE_FOR_LEGAL_REASONS"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_IMPLEMENTED"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE"
  | "GATEWAY_TIMEOUT"
  | "HTTP_VERSION_NOT_SUPPORTED"
  | "VARIANT_ALSO_NEGOTIATES"
  | "INSUFFICIENT_STORAGE"
  | "LOOP_DETECTED"
  | "NOT_EXTENDED"
  | "NETWORK_AUTHENTICATION_REQUIRED";
