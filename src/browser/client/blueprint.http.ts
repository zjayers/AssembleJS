import axios, { AxiosInstance, AxiosRequestConfig, AxiosStatic } from "axios";
import type { ViewContext } from "../../types/component.context";
import { statusCodes } from "../common/http.status.codes";

/**
 * Interface for the base Assemble http client that is exposed to client and server instances.
 * @interface BlueprintHttpClient
 * @extends {AxiosStatic}
 * @author Zachariah Ayers
 */
type BlueprintHttpClient = AxiosStatic & {
  useApi: (context: ViewContext, opts?: AxiosRequestConfig) => AxiosInstance;
  statusCodes: typeof statusCodes;
};

/**
 * Base Assemble http client implementation that is exposed to client and server instances.
 * @type {BlueprintHttpClient}
 * @author Zachariah Ayers
 */
export const http: BlueprintHttpClient = axios as BlueprintHttpClient;

/**
 * USE API Hook - usable outside an Assemble View to scope an API to the current server.
 * @param {ViewContext} context - The current view context.
 * @param {AxiosRequestConfig} opts - The options to use for the request.
 * @return {AxiosInstance} - The axios instance to use for the request.
 */
http.useApi = (context: ViewContext, opts?: AxiosRequestConfig) =>
  axios.create({
    baseURL: context.serverUrl.split("/").slice(0, -3).join("/"),
    withCredentials: true,
    ...opts,
  });

/**
 * Status Codes Interface - The status codes that are available to use when reporting HTTP codes.
 * @type {typeof statusCodes} - The status codes that are available to use when reporting HTTP codes.
 * @author Zachariah Ayers
 */
http.statusCodes = statusCodes;
