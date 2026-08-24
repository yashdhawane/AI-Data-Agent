import express, { type Router } from "express";
import { executeQuery } from "./query.controller.js";

const router: Router = express.Router();

router.post("/query", executeQuery);

export default router;