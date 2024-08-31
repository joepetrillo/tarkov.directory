import { treaty } from "@elysiajs/eden";
import { Elysia, t } from "elysia";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .get("/", "Hi Elysia")
  .get("/id/:id", ({ params: { id } }) => id)
  .post("/mirror", ({ body }) => body, {
    body: t.Object({
      id: t.Number(),
      name: t.String(),
    }),
  })
  .listen(3000);

export const client = treaty<typeof app>("http://localhost:3000");
