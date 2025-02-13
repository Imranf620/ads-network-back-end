import express from 'express';
import { uploadFile, downloadFile, getSignedUrlHandler, checkAndDeleteFile } from '../controllers/fileController.js';
import { isAdmin, isLoggedIn } from '../middlewares/auth.js';
const router = express.Router();

router.post('/upload', isLoggedIn, isAdmin, uploadFile);

router.post('/download', downloadFile);
router.post('/get-preassignedulr',isLoggedIn, isAdmin,  getSignedUrlHandler);
router.post('/check-and-delete', isLoggedIn, isAdmin, checkAndDeleteFile)



export default router;