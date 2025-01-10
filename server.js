import express from "express";
import connectDb from "./config/connectDb.js";
import "dotenv/config";
import error from "./middlewares/error.js";
import apiResponse from "./utils/apiResponse.js";
import route from "./routes/indexRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
const port = process.env.PORT || 4000;
import path from "path";
import { fileURLToPath } from "url";



app.use(express.json());
app.use(express.json({
  limit: "50mb",
  extended: true,
}))
// app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Content-Disposition', 'attachment'); // Force download
  }
}));

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5501",
      "http://localhost:5001",
      "http://localhost:5002",
      "http://localhost:5003",
      "http://localhost:5004",
      "http://localhost:10001",
      "http://localhost:10002",
      "http://localhost:10003",


    ],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
    ],
    exposedHeaders: ["Authorization"],
  })
);

app.get("/", (req, res) =>
  apiResponse(true, 200, "Welcome to the API", null, res)
);
app.use("/api/v1", route);

app.use(error);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
});

const app5501 = express();
const port5501 = 5501;

// Serve the HTML file on port 5501
app5501.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "5501.html"));
});

app5501.listen(port5501, () => {
  console.log(`Server is running on port ${port5501}`);
});

const redirect1 = express();
const redirect2 = express();
const redirect3 = express();

// Port numbers for different redirect pages
const redirectPort1 = 10001;
const redirectPort2 = 10002;
const redirectPort3 = 10003;

// Array of files to serve
const files1 = ["redirect.html"];
const files2 = ["redirect2.html"];
const files3 = ["redirect3.html"];

// Serve the redirect page on port 5502
redirect1.get("/", (req, res) => {
  const randomIndex = Math.floor(Math.random() * files1.length);
  const fileToServe = files1[randomIndex];
  res.sendFile(path.resolve("public", fileToServe));
});

// Serve the redirect page on port 5503
redirect2.get("/", (req, res) => {
  const randomIndex = Math.floor(Math.random() * files2.length);
  const fileToServe = files2[randomIndex];
  res.sendFile(path.resolve("public", fileToServe));
});

// Serve the redirect page on port 5504
redirect3.get("/", (req, res) => {
  const randomIndex = Math.floor(Math.random() * files3.length);
  const fileToServe = files3[randomIndex];
  res.sendFile(path.resolve("public", fileToServe));
});

// Start each server on different ports
redirect1.listen(redirectPort1, () => {
  console.log(
    `Redirect server 1 is running on http://localhost:${redirectPort1}`
  );
});

redirect2.listen(redirectPort2, () => {
  console.log(
    `Redirect server 2 is running on http://localhost:${redirectPort2}`
  );
});

redirect3.listen(redirectPort3, () => {
  console.log(
    `Redirect server 3 is running on http://localhost:${redirectPort3}`
  );
});

const template = express();
const template2 = express();
const template3 = express();
const template4 = express();


// Port numbers for different redirect pages
const templatePort = 5001;
const templatePort2 = 5002;
const templatePort3 = 5003;
const templatePort4 = 5004;


template.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "template.html"));
});

template2.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "template2.html"));
});
template3.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "template3.html"));
});
template4.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "template4.html"));
});

template.listen(templatePort, () => {
  console.log(`Template server is running on http://localhost:${templatePort}`);
});

template2.listen(templatePort2, () => {
  console.log(
    `Template server 2 is running on http://localhost:${templatePort2}`
  );
});

template3.listen(templatePort3, () => {
  console.log(
    `Template server 3 is running on http://localhost:${templatePort3}`
  );
});

template4.listen(templatePort4, () => {
  console.log(
    `Template server 4 is running on http://localhost:${templatePort4}`
  );
})

