import express from "express";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import gymRoutes from "./routes/gym.routes.js";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/gyms", gymRoutes);

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
