import express, { type Router } from "express";
import { requireAdmin } from "../../infrastructure/security/auth.middleware.js";
import { discoverRelationships, listRelationships, updateRelationship } from "./relationship.controller.js";

const router: Router = express.Router();

router.get("/relationships", listRelationships);
router.post("/relationships/discover", requireAdmin, discoverRelationships);
router.patch("/relationships/:id", requireAdmin, updateRelationship);

export default router;
