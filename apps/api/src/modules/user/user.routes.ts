import express, { type Router } from "express";
import { createUser, listUsers } from "./user.controller.js";
import { requireAdmin } from "../../infrastructure/security/auth.middleware.js";

const router: Router = express.Router();

router.get("/", listUsers);
router.post("/", requireAdmin, createUser);

export default router;
