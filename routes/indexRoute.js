import express from "express"
import userRoute from "./userRoute.js"
import domainRoute from "./domainRoute.js"

const router = express.Router();

router.use('/user', userRoute)
router.use('/domain', domainRoute)


export default router