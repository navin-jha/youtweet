import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3000;

app.on("error", (error) => {
  console.log("ERROR:", error);
  throw error;
});

app.listen(PORT, () => {
  console.log(`✅ Server app listening on port ${PORT}`);
});
