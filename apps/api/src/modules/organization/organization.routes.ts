import express, { type Router } from "express";
import { createOrganization } from "./organization.controller.js";
import { getPlan, updatePlan } from "./organization.plan.controller.js";
import { requireAdmin } from "../../infrastructure/security/auth.middleware.js";

const router: Router = express.Router();

router.post("/", createOrganization);
router.get("/plan", getPlan);
router.patch("/plan", requireAdmin, updatePlan);

export default router;
