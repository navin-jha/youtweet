import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./database/index.js";
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`✅ Server app listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed !!", error);
  });
