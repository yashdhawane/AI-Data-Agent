import express, { type Router } from "express";
import { login, logout, me, register } from "./auth.controller.js";
import { authenticate } from "../../infrastructure/security/auth.middleware.js";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
