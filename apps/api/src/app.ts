import express, { type Express } from "express";

import healthRouter from "./modules/health/health.routes.js";
import userRouter from "./modules/user/user.routes.js";
import dataSourceRouter from "./modules/data-source/data-source.routes.js";
import metadataRouter from "./modules/metadata/metadata.routes.js";
import queryRouter from "./modules/query/query.routes.js";
import agentRouter from "./modules/agent/agent.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import { authenticate } from "./infrastructure/security/auth.middleware.js";
import { errorHandler } from "./infrastructure/http/error-handler.js";
import relationshipRouter from "./modules/relationship/relationship.routes.js";
import businessContextRouter from "./modules/business-context/business-context.routes.js";

export function createApp(): Express {
  const app = express();

  app.use((req, res, next) => {
    const origin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);

  app.use(authenticate);
  app.use("/users", userRouter);
  app.use("/data-sources", dataSourceRouter);

  app.use(metadataRouter);
  app.use(queryRouter);
  app.use(agentRouter);
  app.use(relationshipRouter);
  app.use(businessContextRouter);

  // MUST BE LAST
  app.use(errorHandler);

  return app;
}