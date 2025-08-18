import express from "express";
import authenticate from "../middleware/authenticate.middleware";
import { authorizeRole } from "../middleware/role_check.middleware.js";
import {
  getMyLand,
  addLand,
  addDispute,
  cancelTransfer,
  addToTransfer,
  MyDispute,
  myTransfer,
  getMe,
} from "../controllers/owner.controller.js";

const router = express.Router();

router.get("/me", authenticate, authorizeRole("owner"), getMe);
router.get("/myland", authenticate, authorizeRole("owner"), getMyLand);
router.post("/addland", authenticate, authorizeRole("owner"), addLand);

router.post("/addDispute", authenticate, authorizeRole("owner"), addDispute);

router.get("/MyDispute", authenticate, authorizeRole("owner"), MyDispute);
router.put(
  "/removeDispute/:id",
  authenticate,
  authorizeRole("owner"),
  removeDispute
);
router.put(
  "/cancelTransfer/:transferId",
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

router.get("/MyTransfers", authenticate, authorizeRole("owner"), myTransfer);

export default router;
