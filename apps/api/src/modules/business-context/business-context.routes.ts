import express, { type Router } from "express";
import { requireAdmin } from "../../infrastructure/security/auth.middleware.js";
import { getBusinessContext, saveBusinessContext } from "./business-context.controller.js";

const router: Router = express.Router();

router.get("/business-context", getBusinessContext);
router.put("/business-context", requireAdmin, saveBusinessContext);

export default router;
