import type { OnCloseHook } from "./on.close";
import type { OnErrorHook } from "./on.error";
import type { OnReadyHook } from "./on.ready";
import type { OnRegisterHook } from "./on.register";
import type { OnRequestHook } from "./on.request";
import type { OnResponseHook } from "./on.response";
import type { OnRouteHook } from "./on.route";
import type { OnSendHook } from "./on.send";
import type { OnTimeoutHook } from "./on.timeout";
import type { PreHandlerHook } from "./pre.handler";
import type { PreParsingHook } from "./pre.parsing";
import type { PreSerializationHook } from "./pre.serialization";
import type { PreValidationHook } from "./pre.validation";

export type GenericHook =
  | { onClose: OnCloseHook }
  | { onError: OnErrorHook }
  | { onReady: OnReadyHook }
  | { onRegister: OnRegisterHook }
  | { onRequest: OnRequestHook }
  | { onResponse: OnResponseHook }
  | { onRoute: OnRouteHook }
  | { onSend: OnSendHook<any> }
  | { onTimeout: OnTimeoutHook }
  | { preHandler: PreHandlerHook }
  | { preParsing: PreParsingHook }
  | { preSerialization: PreSerializationHook<any> }
  | { preValidation: PreValidationHook };
