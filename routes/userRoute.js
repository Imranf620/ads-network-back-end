import express from "express";
import {
  getAllUsers,
  getMyProfile,
  getMyRequestsForAd,
  login,
  logout,
  register,
  requestForAd,
  approveAdRequest,
} from "../controllers/userController.js";
import { isAdmin, isLoggedIn } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", isLoggedIn, getMyProfile);
router.get("/logout", isLoggedIn, logout);
router.get("/all", isLoggedIn, isAdmin, getAllUsers);

router.post("/requestForAd", isLoggedIn, requestForAd);

router.get("/myRequestsForAd", isLoggedIn, getMyRequestsForAd);

router.put("/approveAdRequest", isLoggedIn, isAdmin, approveAdRequest);

export default router;