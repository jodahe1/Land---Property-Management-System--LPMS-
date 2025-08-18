import express from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { authorizeRole } from "../middleware/role_check.middleware.js";
const router = express.Router();

router.get("/me", authenticate, authorizeRole("Admin"), getMe);
router.post("/approveLand", authenticate, authorizeRole("Admin"), approveLand);
router.post(
  "/approvetransfer",
  authenticate,
  authorizeRole("Admin"),
  approvetransfer
);
router.post("/fixDisputes", authenticate, authorizeRole("Admin"), fixDisputes);
router.get("/seeTransfers", authenticate, authorizeRole("Admin"), seeTransfers);
router.get("/seeDisputes", authenticate, authorizeRole("Admin"), seeDisputes);

export default router;
