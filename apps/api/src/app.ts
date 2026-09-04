import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

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
import organizationRouter from "./modules/organization/organization.routes.js";

export function createApp(): Express {
  const app = express();

  const allowedOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
  const maxRequests = Number(process.env.RATE_LIMIT_MAX ?? 300);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: allowedOrigin, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(rateLimit({
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 15 * 60 * 1000,
    limit: Number.isFinite(maxRequests) && maxRequests > 0 ? maxRequests : 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }));

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);

  app.use(authenticate);
  app.use("/users", userRouter);
  app.use("/organization", organizationRouter);
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