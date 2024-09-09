import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";



const router = Router();

router.route("/:userId/stats").get(getChannelStats);
router.route("/:userId/videos").get(getChannelVideos);

export default router;





