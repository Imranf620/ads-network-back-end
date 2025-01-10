import express from "express"
import userRoute from "./userRoute.js"
import domainRoute from "./domainRoute.js"
import filesRoute from "./filesRoute.js"

const router = express.Router();

router.use('/user', userRoute)
router.use('/domain', domainRoute)
router.use('/file', filesRoute)


export default router