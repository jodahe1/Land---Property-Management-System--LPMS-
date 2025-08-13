import express from "express";
import authenticate from "../middleware/authenticate.middleware";
import { authorizeRole } from "../middleware/role_check.middleware.js";
import {
  getMyLand,
  addLand,
  addDispute,
  cancelTransfer,
  addToTransfer,
} from "../controllers/owner.controller.js";

const router = express.Router();

router.get("/myland", authenticate, authorizeRole("owner"), getMyLand);
router.post("/addland", authenticate, authorizeRole("owner"), addLand);

router.post("/addDispute", authenticate, authorizeRole("owner"), addDispute);
router.put(
  "/removeDispute",
  authenticate,
  authorizeRole("owner"),
  removeDispute
);
router.put(
  "/cancelTransfer",
  authenticate,
  authorizeRole("owner"),
  cancelTransfer
);

router.post(
  "/addToTransfer",
  authenticate,
  authorizeRole("owner"),
  addToTransfer
);

export default router;
