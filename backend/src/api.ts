import Elysia from "elysia";
import { cron } from "@elysiajs/cron";
import { gunsRoutes } from "./routes/guns";
import { tarkovDataCache } from "./services/tarkov-data-cache";
import { helmet } from "elysia-helmet";

const apiKeyAuth = (app: Elysia) => {
  return app.onBeforeHandle(({ request, set }) => {
    const apiKey = request.headers.get("API-Key");
    if (!apiKey || apiKey !== process.env.API_KEY) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
};

export const api = new Elysia()
  .use(helmet())
  .use(apiKeyAuth)
  .use(gunsRoutes)
  .use(
    cron({
      name: "update-cache",
      pattern: "0 * * * *", // Hourly — flea prices move; dump is ~2MB gzip
      async run() {
        try {
          await tarkovDataCache.refresh();
        } catch (error) {
          console.error("Scheduled cache update failed:", error);
        }
      },
    })
  )
  .onStart(async () => {
    console.log("Initializing cache on startup");
    try {
      await tarkovDataCache.refresh();
    } catch (error) {
      // Still listen — first request can retry via ensureCached; don't crash the process.
      console.error("Startup cache warm failed:", error);
    }
  });
