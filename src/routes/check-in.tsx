import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const PresenceCheckInPage = lazyRouteComponent(
  () => import("@/pages/PresenceCheckIn/PresenceCheckInPage"),
  "PresenceCheckInPage",
);

export const Route = createFileRoute("/check-in")({
  component: PresenceCheckInPage,
});
