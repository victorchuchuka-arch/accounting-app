interface Env {
  DB: D1Database;
}

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
    };
  }
}