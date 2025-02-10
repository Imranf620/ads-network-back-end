import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import File from "../models/filesModel.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import apiResponse from "../utils/apiResponse.js";
import Domain from "../models/domainModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = catchAsyncError(async (req, res) => {
  try {
    const domainId = req.body.domainId;
    const password = req.body.password;
    const fileUrl = req.body.fileUrl;
  

    if (!domainId) {
      return apiResponse(false, 400, "Domain ID is required", null, res);
    }

    if (!req.file && fileUrl.length === 0) {
      console.log("No file uploaded");
      return apiResponse(false, 400, "No file uploaded", null, res);
    }

    // Check if the domain already has a file uploaded
    const existingFile = await File.findOne({ domain: domainId });

    // If there's an existing file, delete it from the filesystem
    if (existingFile && fileUrl.length === 0) {
      const filePath = path.join(__dirname, "../uploads", existingFile.path);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting existing file:", err);
        } else {
          console.log("Old file deleted successfully");
        }
      });

      // Remove the existing file from the database
      await File.findByIdAndDelete(existingFile._id);

      console.log("Old file entry removed from database");
    }

    // Save the new file to the database with relative path
    const fileData = {
      fileName: fileUrl.length === 0 ? req.file.originalname : "fileUrl",
      path: fileUrl.length === 0 ? `uploads/${req.file.filename}` : fileUrl,
      domain: domainId,
      password,
    };

    const newFile = await File.create(fileData);
    console.log("New file saved to database:", newFile);

    return apiResponse(true, 200, "File uploaded successfully", newFile, res);
  } catch (error) {
    console.log(error);
    return apiResponse(
      false,
      500,
      "An error occurred while uploading the file",
      null,
      res
    );
  }
});

export const downloadFile = catchAsyncError(async (req, res, next) => {
  try {
    let { host } = req.body;

    // Extract the server host (port 4000 in this case)
    const serverHost = "localhost:4000"; // Adjust this to your actual server host and port

    const httpsHost = host.startsWith("https://") ? host : `https://${host}`;
    const httpHost = host.startsWith("http://") ? host : `http://${host}`;
    const plainHost = host.replace(/^https?:\/\//i, "");

    // Find the domain entry in the database
    const domainExists = await Domain.findOne({
      $or: [{ domain: httpsHost }, { domain: httpHost }, { domain: plainHost }],
    });

    if (!domainExists) {
      return apiResponse(false, 404, "Domain not found", null, res);
    }

    // Find the file associated with the domain
    const file = await File.findOne({ domain: domainExists._id });
    if (!file) {
      return apiResponse(false, 404, "File not found", null, res);
    }

    // Correct the file URL generation to use the server host (localhost:4000)
    const fileUrl = `${serverHost}/${file.path}`;

    // Return the URL for download
    return apiResponse(
      true,
      200,
      "File ready for download",
      { fileUrl, password: file.password },
      res
    );
  } catch (error) {
    console.log(error);
    return apiResponse(false, 500, "An error occurred", null, res);
  }
});
