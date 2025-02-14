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
  addAClick,
  getClickStats
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
router.get('/stats', isLoggedIn, isAdmin, getClickStats)


router.post("/addAClick", addAClick);

export default router;
