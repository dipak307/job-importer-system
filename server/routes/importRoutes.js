import express from "express";
import { startImport , getLogs,getLogById} from "../controllers/importController.js";

const router = express.Router();

router.post("/start", startImport);
router.get("/logs", getLogs);
router.get("/logs/:id", getLogById);

export default router;
