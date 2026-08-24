import express, { type Router } from "express";
import { createOrganization } from "./organization.controller.js";

const router: Router = express.Router();

router.post("/", createOrganization);

export default router;
