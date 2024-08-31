import { Elysia } from "elysia";

const apiKeyAuth = (app: Elysia) =>
  app.onBeforeHandle(({ request, set }) => {
    const apiKey = request.headers.get("API-Key");
    if (!apiKey || apiKey !== process.env.API_KEY) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });

const app = new Elysia()
  .use(apiKeyAuth)
  .get("/", () => ({ message: "This is protected data" }))
  .listen(3001);

export type App = typeof app;

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
