import fs from "fs";

const envConfig = `window.env = {
  API_URL:  "https://databloom.xyz/api",
  };`;

fs.writeFileSync(path.join(__dirname, "public/.env.js"), envConfig);
