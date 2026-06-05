import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { auth } from "./utils/auth";

export const router = createRouter({
  routeTree,
  context: {
    auth,
  },
});

