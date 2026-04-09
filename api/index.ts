import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app.js";

const app = await buildApp();
await app.ready();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const response = await app.inject({
    method: req.method ?? "GET",
    url: req.url ?? "/",
    headers: req.headers as Record<string, string>,
    payload: req,
  });

  res.writeHead(response.statusCode, response.headers);
  res.end(response.body);
}
