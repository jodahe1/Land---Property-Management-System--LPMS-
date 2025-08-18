import express from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { authorizeRole } from "../middleware/role_check.middleware.js";
import {
  getMe,
  approveLand,
  approvetransfer,
  fixDisputes,
  seeTransfers,
  seeDisputes,
  listPendingLands,
  reviewAndApproveLand,
  seeLands,
} from "../controllers/admin.controller.js";
const router = express.Router();

router.get("/me", authenticate, authorizeRole("admin"), getMe);
router.post("/approveLand", authenticate, authorizeRole("admin"), approveLand);
router.post(
  "/approvetransfer",
  authenticate,
  authorizeRole("admin"),
  approvetransfer
);
router.post("/fixDisputes", authenticate, authorizeRole("admin"), fixDisputes);
router.get("/seeTransfers", authenticate, authorizeRole("admin"), seeTransfers);
router.get("/seeDisputes", authenticate, authorizeRole("admin"), seeDisputes);
router.get(
  "/pendingLands",
  authenticate,
  authorizeRole("admin"),
  listPendingLands
);

router.post(
  "/reviewAndApproveLand",
  authenticate,
  authorizeRole("admin"),
  reviewAndApproveLand
);

router.get(
  "/seeLands",
  authenticate,
  authorizeRole("admin"),
  seeLands
);

export default router;
