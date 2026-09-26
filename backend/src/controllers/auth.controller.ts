import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginMember = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password.",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return res.status(401).json({
      message: "Invalid username or password.",
    });
  }

  if (user.status === "DEACTIVATED") {
    return res.status(403).json({
      message: "This account has been deactivated.",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  return res.status(200).json({
    message: "Login successful!",
    token,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      role: user.role,
    },
  });
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
    include: {
      managedGym: {
        select: {
          id: true,
          name: true,
          gymCode: true,
          address: true,
          description: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  return res.status(200).json({
    message: "You are authenticated!",
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      managedGym: user.managedGym,
    },
  });
};

export const setupSuperAdmin = async (req: Request, res: Response) => {
  const { setupSecret } = req.body;

  if (!setupSecret) {
    return res.status(400).json({
      message: "Setup secret is required.",
    });
  }

  if (setupSecret !== process.env.SUPER_ADMIN_SETUP_SECRET) {
    return res.status(401).json({
      message: "Invalid setup secret.",
    });
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
    },
  });

  if (existingSuperAdmin) {
    return res.status(409).json({
      message: "A Super Admin already exists.",
    });
  }

  const username = process.env.SUPER_ADMIN_USERNAME;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!username || !password) {
    return res.status(500).json({
      message: "Super Admin setup variables are not configured.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.create({
    data: {
      username,
      firstName: "Super",
      lastName: "Admin",
      phone: "0000000000",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  return res.status(201).json({
    message: "Super Admin created successfully.",
    user: {
      id: superAdmin.id,
      username: superAdmin.username,
      role: superAdmin.role,
    },
  });
};
