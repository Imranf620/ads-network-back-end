import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import File from "../models/filesModel.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import apiResponse from "../utils/apiResponse.js";
import Domain from "../models/domainModel.js";

import pkg from "@aws-sdk/s3-request-presigner";
const { getSignedUrl } = pkg;
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);

// AWS S3 setup (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export const getSignedUrlHandler = async (req, res) => {
  try {
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res
        .status(400)
        .json({ message: "Filename or fileType not provided" });
    }

    const fileName = `ads/${filename}`;
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      ACL: "public-read",
    };

    // Create a PutObjectCommand
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ url });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ message: "Error generating presigned URL" });
  }
};

export const checkAndDeleteFile = catchAsyncError(async (req, res) => {
  try {
    const { domainId } = req.body;

    if (!domainId) {
      return res.status(400).json({ message: "Domain ID is required" });
    }

    const existingFile = await File.findOne({ domain: domainId });

    if (existingFile) {
      const oldFileKey = `ads/${existingFile.fileName}`;

      // Delete old file from S3
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: oldFileKey,
        });
        await s3.send(deleteCommand);
        console.log("Old file deleted from S3");
      } catch (deleteError) {
        console.error("Error deleting old file from S3:", deleteError);
      }

      // Remove old file from database
      await File.findByIdAndDelete(existingFile._id);
      console.log("Old file entry removed from database");
    }

    return res.status(200).json({ success: true, message: "Existing file deleted (if any)" });
  } catch (error) {
    console.error("Error checking and deleting file:", error);
    return res.status(500).json({ message: "Error checking and deleting file" });
  }
});


export const uploadFile = catchAsyncError(async (req, res) => {
  try {
    const { fileName, domainId, password } = req.body;
    console.log(fileName)

    if (!fileName || !domainId) {
      return res.status(400).json({ message: "File name and domain ID are required" });
    }

    const fileUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.BUCKET_NAME}/ads/${fileName}`;

    // Save new file in the database
    const newFile = await File.create({
      fileName,
      path: fileUrl,
      domain: domainId,
      password,
    });

    console.log("New file saved to database:", newFile);
    return res.status(200).json({ success: true, message: "File uploaded successfully", newFile });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "An error occurred while uploading the file" });
  }
});

export const downloadFile = catchAsyncError(async (req, res, next) => {
  try {
    let { host } = req.body;
    console.log("host", host);

    // Normalize the host: Ensure it starts with https:// and has a trailing slash
    const normalizedHost = host.replace(/^https?:\/\//i, "").replace(/\/$/, "") + "/"; 

    const httpsHost = `https://${normalizedHost}`;
    const httpHost = `http://${normalizedHost}`;

    // Find the domain entry in the database
    const domainExists = await Domain.findOne({
      $or: [
        { domain: httpsHost }, 
        { domain: httpHost },
        { domain: normalizedHost }, 
        { domain: host.endsWith("/") ? host : host + "/" } // Ensure trailing slash in query
      ],
    });

    console.log(domainExists);

    if (!domainExists) {
      return apiResponse(false, 404, "Domain not found", null, res);
    }

    // Find the file associated with the domain
    const file = await File.findOne({ domain: domainExists._id });
    if (!file) {
      return apiResponse(false, 404, "File not found", null, res);
    }

    // File URL
    const fileUrl = file.path;

    return apiResponse(true, 200, "File ready for download", { fileUrl, password: file.password }, res);

  } catch (error) {
    console.error(error);
    return apiResponse(false, 500, "An error occurred", null, res);
  }
});
