import express, { type Router } from "express";
import {
  createDataSource,
  testDataSourceConnection,
} from "./data-source.controller.js";

const router: Router = express.Router();

router.post("/", createDataSource);
router.post("/:id/test-connection", testDataSourceConnection);

export default router;