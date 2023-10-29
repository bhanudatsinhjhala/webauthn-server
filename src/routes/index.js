import express from "express";
import * as userController from "../controllers/userController.js";
import catchWraper from "../utils/catchWraper.js";
// create a router
const router = express.Router();

router.post("/login", catchWraper(userController.login));
router.post("/signup", catchWraper(userController.signup));
router.post(
  "/verify-reg-options",
  catchWraper(userController.verifyRegOptions)
);
router.post(
  "/verify-auth-options",
  catchWraper(userController.verifyAuthOptions)
);

export default router;
