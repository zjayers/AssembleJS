import type { Service } from "../abstract/service";

/**
 * Service Container - Simple dependency injection container for AssembleJS
 * @description A lightweight container that maintains singleton services that can be injected into controllers
 * @author Zach Ayers
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, Service> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of the service container
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register a service with the container
   * @param token - The identifier for the service
   * @param service - The service instance (must extend Service base class)
   */
  public register<T extends Service>(token: string, service: T): void {
    this.services.set(token, service);
  }

  /**
   * Get a service from the container
   * @param token - The identifier for the service
   * @returns The service instance
   * @throws Error if the service is not registered
   */
  public get<T extends Service>(token: string): T {
    if (!this.services.has(token)) {
      throw new Error(`Service with token '${token}' not registered`);
    }
    return this.services.get(token) as T;
  }

  /**
   * Check if a service is registered
   * @param token - The identifier for the service
   * @returns True if the service is registered, false otherwise
   */
  public has(token: string): boolean {
    return this.services.has(token);
  }

  /**
   * Clear all registered services
   * Primarily used for testing
   */
  public clear(): void {
    this.services.clear();
  }
}
