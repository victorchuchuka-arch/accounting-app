import { createRequestHandler } from "@react-router/cloudflare";
// @ts-ignore
import * as build from "../build/server/index.js";

const requestHandler = createRequestHandler(build);

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      return await requestHandler(request, {
        cloudflare: { env, ctx },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};