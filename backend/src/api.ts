import Elysia from "elysia";
import { gunsRoutes } from "./routes/guns";

const apiKeyAuth = (app: Elysia) => {
  return app.onBeforeHandle(({ request, set }) => {
    const apiKey = request.headers.get("API-Key");
    if (!apiKey || apiKey !== process.env.API_KEY) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
};

export const api = new Elysia().use(apiKeyAuth).use(gunsRoutes);
