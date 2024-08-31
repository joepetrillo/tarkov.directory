import Elysia from "elysia";
import { cron } from "@elysiajs/cron";
import { gunsRoutes } from "./routes/guns";
import { cacheUpdateService } from "./services/cache-update-service";

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
  .use(apiKeyAuth)
  .use(gunsRoutes)
  .use(
    cron({
      name: "update-cache",
      pattern: "0 0 * * *", // Run daily at midnight
      run() {
        console.log("Updating cache");
        cacheUpdateService.updateAllCachedData();
      },
    })
  )
  .onStart(async () => {
    console.log("Initializing cache on startup");
    await cacheUpdateService.updateAllCachedData();
  });
