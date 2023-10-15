import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { KANJI_DATA_SET } from "@tegaki/dataset";
import { recognize } from "@tegaki/backend";
import { DecodeError, decodeStroke } from "@tegaki/utils";

const app = new Hono();

app.use("/recognize", cors());
app.use("/recognize-encoded", cors());

app.post("/recognize", async c => {
  const req = await c.req.json();
  console.log(`size: ${JSON.stringify(req.strokes).length} bytes`);
  const strokes = req.strokes;
  const candidate = recognize(strokes, KANJI_DATA_SET);
  return c.json(candidate);
});

app.post("/recognize-encoded", async c => {
  const req = await c.req.json();
  console.log(`size: ${req.strokes.length} bytes`);
  const strokes = decodeStroke(req.strokes);
  if (strokes instanceof DecodeError) {
    return c.json({ error: strokes.message });
  }
  const candidate = recognize(strokes, KANJI_DATA_SET);
  return c.json(candidate);
});

serve({ fetch: app.fetch, port: 3000 });
console.log("Server started on port localhost:3000");
