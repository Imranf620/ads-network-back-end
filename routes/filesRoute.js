import express from 'express';
import { upload } from '../config/multer.js';
import { uploadFile, downloadFile } from '../controllers/fileController.js';
import { isAdmin, isLoggedIn } from '../middlewares/auth.js';
const router = express.Router();

router.post('/upload', isLoggedIn, isAdmin,  upload.single('file'), uploadFile);

router.post('/download', downloadFile);



export default router;