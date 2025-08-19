import express from "express";
import authenticate from "../middleware/authenticate.middleware.js";
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
  removeDispute,
  seeLands,
  placeBid,
  confirmTransfer,
  marketTransfers,
} from "../controllers/owner.controller.js";

const router = express.Router();

router.get("/me", authenticate, authorizeRole("owner"), getMe);
router.get("/myland", authenticate, authorizeRole("owner"), getMyLand);
router.get("/seeLands", authenticate, authorizeRole("owner"), seeLands);
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
router.get("/marketTransfers", authenticate, authorizeRole("owner"), marketTransfers);

// Bidding endpoints
router.post(
  "/placeBid/:transferId",
  authenticate,
  authorizeRole("owner"),
  placeBid
);
router.post(
  "/confirmTransfer/:transferId",
  authenticate,
  authorizeRole("owner"),
  confirmTransfer
);

export default router;
