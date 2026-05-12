export {};

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    breadcrumb?: string;
    headline?: string;
  }
}
