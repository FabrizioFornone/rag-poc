import express from "express";
import { ragRouter } from "./ragRouter";

export const router = express.Router();

// rag routes collection
router.use("/rag", ragRouter);
