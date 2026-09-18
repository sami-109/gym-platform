import "dotenv/config";
import express from "express";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import gymRoutes from "./routes/gym.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import memberRoutes from "./routes/member.routes.js";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/gyms", gymRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/members", memberRoutes);

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Gym Platform API is running!");
});

app.post("/api/test", (req, res) => {
  console.log(req.body);

  res.json({
    message: "Data received!",
    data: req.body,
  });
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    await prisma.$connect();
    console.log("Database connected!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});
