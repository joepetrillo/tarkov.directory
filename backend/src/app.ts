import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { api } from "./api";

export const app = new Elysia().use(logger()).use(api);
