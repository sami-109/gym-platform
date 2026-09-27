import "dotenv/config";
import express from "express";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import manageAdminRoutes from "./routes/manageAdmin.routes.js";
import adminGymRoutes from "./routes/adminGym.routes.js";
import manageGymRoutes from "./routes/manageGym.routes.js";
import manageMemberRoutes from "./routes/manageMember.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import membershipPriceRoutes from "./routes/membershipPrice.routes.js";
import activityLogRoutes from "./routes/activityLog.routes.js";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/admins", manageAdminRoutes);
app.use("/api/admin-gym", adminGymRoutes);

app.use("/api/gyms", manageGymRoutes);
app.use("/api/members", manageMemberRoutes);
app.use("/api/memberships", membershipRoutes);

app.use("/api/transactions", transactionRoutes);
app.use("/api/membership-prices", membershipPriceRoutes);
app.use("/api/activity-logs", activityLogRoutes);

app.use(errorMiddleware);

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Gym Platform API is running!");
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

startServer();
