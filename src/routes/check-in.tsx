import { PresenceCheckInPage } from "@/pages/PresenceCheckIn/PresenceCheckInPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/check-in")({
  component: PresenceCheckInPage,
});

