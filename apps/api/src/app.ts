import express, { type Express } from "express";

import healthRouter from "./modules/health/health.routes.js";
import organizationRouter from "./modules/organization/organization.routes.js";
import userRouter from "./modules/user/user.routes.js";
import dataSourceRouter from "./modules/data-source/data-source.routes.js";
import metadataRouter from "./modules/metadata/metadata.routes.js";
import queryRouter from "./modules/query/query.routes.js";

import { errorHandler } from "./infrastructure/http/error-handler.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/organizations", organizationRouter);
  app.use("/users", userRouter);
  app.use("/data-sources", dataSourceRouter);

  app.use(metadataRouter);
  app.use(queryRouter);

  // MUST BE LAST
  app.use(errorHandler);

  return app;
}