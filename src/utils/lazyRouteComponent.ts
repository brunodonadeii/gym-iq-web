import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const lazyRouteComponent = <
  Module extends Record<ExportName, ComponentType>,
  ExportName extends keyof Module,
>(
  importer: () => Promise<Module>,
  exportName: ExportName,
): LazyExoticComponent<Module[ExportName]> =>
  lazy(async () => ({
    default: (await importer())[exportName],
  }));
