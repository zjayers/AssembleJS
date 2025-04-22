// Server specific config
import type { FastifyStaticOptions } from "@fastify/static";
import type { Component, ComponentManifest } from "./component";
import type { BlueprintController } from "../server/abstract/blueprint.controller";
import type { Service } from "../server/abstract/service";

type PathLikeEntry = { path: string };
type PathLikeArray<Opts> = Array<PathLikeEntry & { opts?: Opts }>;

/**
 * Options required to build an AssembleJS server
 * @public
 * @category (AssembleJS)
 * @author Zach Ayers
 * @example
 * ```typescript
 * const opts: BlueprintServerOptions = {
 *   host: "0.0.0.0",
 *   port: 3000,
 *   publicDirectories: ["./dist", "./public"],
 * };
 * ```
 */
export interface BlueprintServerManifest {
  components?: ComponentManifest;
  readonly developmentOptions?: Component["developmentOptions"];
  readonly assetDirectoryRoots?: PathLikeArray<
    Omit<FastifyStaticOptions, "root">
  >;
  readonly controllers?:
    | Array<{
        new (): NoConstructor<BlueprintController> | BlueprintController;
      }>
    | Array<{
        new (...args: any[]):
          | NoConstructor<BlueprintController>
          | BlueprintController;
      }>;
  /**
   * Services to be registered with the dependency injection container
   * Key is the service token that will be used to retrieve the service
   * Value is the service class constructor that extends the Service base class
   */
  readonly services?: Record<string, { new (...args: any[]): Service }>;
  readonly shared?: Component["shared"];
}

type NoConstructor<T> = Pick<T, keyof T>;
