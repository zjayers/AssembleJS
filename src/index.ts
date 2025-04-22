import { createBlueprintServer } from "./server/app/create-blueprint.server";
import * as array from "./utils/array.utils";
import * as boolean from "./utils/boolean.utils";
import * as html from "./utils/html.utils";
import * as http from "./utils/http.utils";
import * as json from "./utils/json.utils";
import * as number from "./utils/number.utils";
import * as object from "./utils/object.utils";
import * as string from "./utils/string.utils";
import * as verify from "./utils/verify.utils";
import * as env from "./utils/env.utils";
import * as onClose from "./server/hooks/on.close";
import * as onError from "./server/hooks/on.error";
import * as onReady from "./server/hooks/on.ready";
import * as onRegister from "./server/hooks/on.register";
import * as onRequest from "./server/hooks/on.request";
import * as onResponse from "./server/hooks/on.response";
import * as onRoute from "./server/hooks/on.route";
import * as onSend from "./server/hooks/on.send";
import * as onTimeout from "./server/hooks/on.timeout";
import * as preHandler from "./server/hooks/pre.handler";
import * as preParsing from "./server/hooks/pre.parsing";
import * as preSerialization from "./server/hooks/pre.serialization";
import * as preValidation from "./server/hooks/pre.validation";
import type { ComponentFactory as GenericComponentFactory } from "./types/component.factory";
import type { ComponentPublicData } from "./types/component.simple.types";
import type { ComponentParams } from "./types/component.params";
import type { Component } from "./types/component";
import type {
  ComponentContext,
  PreactViewContext,
  ViewContext,
} from "./types/component.context";

// Utils Interface
export const utils = {
  array,
  boolean,
  html,
  http,
  json,
  number,
  object,
  string,
  verify,
  env,
};

// Hooks Interface
export const hooks = {
  onClose,
  onError,
  onReady,
  onRegister,
  onRequest,
  onResponse,
  onRoute,
  onSend,
  onTimeout,
  preHandler,
  preParsing,
  preSerialization,
  preValidation,
};

// Public Browser Interface
export { BlueprintEvent } from "./browser/eventing/blueprint.event";
export { EventBus, EventListener, events } from "./browser/eventing/event.bus";
export { preact } from "./browser/client/blueprint.preact";
export { http } from "./browser/client/blueprint.http";
export { EventAddress } from "./browser/eventing/event.address";
export { Blueprint } from "./browser/client/blueprint.view";
export { BlueprintClient } from "./browser/client/blueprint.client";
export { BlueprintClientRegistry } from "./browser/client/blueprint.client.registry";
export { ViewContext, PreactViewContext };

// Public Server Interface
export { BlueprintController } from "./server/abstract/blueprint.controller";
export { Service } from "./server/abstract/service";
export { createBlueprintServer };
export type ComponentFactory = GenericComponentFactory<
  ComponentPublicData,
  ComponentParams
>;
export type ServerContext = ComponentContext<
  ComponentPublicData,
  ComponentParams
>;

// Types Interface
export { BlueprintServerManifest } from "./types/blueprint.server.manifest";
export { Component };
export {
  Assembly,
  BlueprintInstance,
  ApiRequest,
  ApiReply,
} from "./types/blueprint.simple.types";
