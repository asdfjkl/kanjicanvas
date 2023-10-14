import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { KANJI_DATA_SET } from "@tegaki/dataset";
import { recognize } from "@tegaki/backend";

const app = new Hono();

app.use("/recognize", cors());

app.post("/recognize", async c => {
  const req = await c.req.json();
  const strokes = req.strokes;
  const candidate = recognize(strokes, KANJI_DATA_SET);
  return c.json(candidate);
});

serve({ fetch: app.fetch, port: 3000 });
console.log("Server started on port localhost:3000");
