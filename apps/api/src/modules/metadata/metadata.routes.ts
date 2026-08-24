import express, { type Router } from "express";
import { getDatabaseMetadata } from "./metadata.controller.js";

const router: Router = express.Router();

router.get("/data-sources/:id/metadata", getDatabaseMetadata);

export default router;