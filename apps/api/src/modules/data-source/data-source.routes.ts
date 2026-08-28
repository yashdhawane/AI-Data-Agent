import express, { type Router } from "express";
import {
  createDataSource,
  deleteDataSource,
  listDataSources,
  testDataSourceConnection,
} from "./data-source.controller.js";
import { requireAdmin } from "../../infrastructure/security/auth.middleware.js";

const router: Router = express.Router();

router.post("/", requireAdmin, createDataSource);
router.get("/", listDataSources);
router.post("/:id/test-connection", testDataSourceConnection);
router.delete("/:id", requireAdmin, deleteDataSource);

export default router;