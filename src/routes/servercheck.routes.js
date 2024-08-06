import { Router } from "express";
import { servercheck } from "../controllers/servercheck.controller.js";



const router = Router();

router.route("/").get(servercheck);


export default router;











