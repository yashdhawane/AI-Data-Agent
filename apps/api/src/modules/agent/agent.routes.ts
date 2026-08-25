import express, { type Router } from "express";
import { executeAgentQuery } from "./agent.controller.js";

const router: Router = express.Router();

router.post("/agent/query", executeAgentQuery);

export default router;