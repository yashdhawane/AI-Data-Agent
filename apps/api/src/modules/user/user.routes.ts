import express, { type Router } from "express";
import { createUser } from "./user.controller.js";

const router: Router = express.Router();

router.post("/", createUser);

export default router;
