import express from "express";
import connectDb from "./config/connectDb.js";
import "dotenv/config";
import error from "./middlewares/error.js";
import apiResponse from "./utils/apiResponse.js";
import route from "./routes/indexRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "50mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res) => {
    res.set("Content-Disposition", "attachment");
  }
}));

app.use(cookieParser());

const localPorts = [
  process.env.PORT || 4000,
  process.env.TEMPLATE_PORT || 5001,
  process.env.TEMPLATE_PORT2 || 5002,
  process.env.TEMPLATE_PORT3 || 5003,
  process.env.TEMPLATE_PORT4 || 5004,
  process.env.REDIRECT_PORT1 || 10001,
  process.env.REDIRECT_PORT2 || 10002,
  process.env.REDIRECT_PORT3 || 10003,
  process.env.BUTTON_PORT || 5501,
  process.env.FRONTEND_PORT || 5173,
];

const localOrigins = localPorts.map((p) => `http://localhost:${p}`);

const externalOrigins = [
  process.env.FRONTEND_URL,
  process.env.REDIRECT1,
  process.env.TEMPLATE1,
  process.env.BUTTON1,
  process.env.REDIRECT2,
  process.env.REDIRECT3,
].filter(Boolean);

const allowedOrigins = [...localOrigins, ...externalOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With"],
    exposedHeaders: ["Authorization"],
  })
);


app.get("/", (req, res) => apiResponse(true, 200, "Welcome to the API", null, res));
app.use("/api/v1", route);
app.use(error);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
});

const createServer = (port, file) => {
  const server = express();
  server.get("/", (req, res) => {
    res.sendFile(path.resolve("public", file));
  });
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

[
  { port: process.env.TEMPLATE_PORT || 5001, file: "template.html" },
  { port: process.env.TEMPLATE_PORT2 || 5002, file: "template2.html" },
  { port: process.env.TEMPLATE_PORT3 || 5003, file: "template3.html" },
  { port: process.env.TEMPLATE_PORT4 || 5004, file: "template4.html" },
  { port: process.env.REDIRECT_PORT1 || 10001, file: "redirect.html" },
  { port: process.env.REDIRECT_PORT2 || 10002, file: "redirect2.html" },
  { port: process.env.REDIRECT_PORT3 || 10003, file: "redirect3.html" },
  { port: process.env.BUTTON_PORT || 5501, file: "5501.html" },
].forEach(({ port, file }) => createServer(port, file));
