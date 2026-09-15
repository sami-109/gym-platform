import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const loginMember = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
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

export const getMe = (req: Request, res: Response) => {
  return res.status(200).json({
    message: "You are authenticated!",
    user: req.user,
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

export const createAdmin = async (req: Request, res: Response) => {
  const { firstName, lastName, phone, email } = req.body;
  if (!firstName || !lastName || !phone) {
    return res.status(400).json({
      message: "First name, last name, and phone are required.",
    });
  }
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin can create Admin accounts.",
    });
  }
  const baseUsername = `${firstName}${lastName}`
    .toLowerCase()
    .replace(/\s+/g, "");

  let username = baseUsername;
  let counter = 2;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  const password = crypto.randomBytes(8).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: {
      phone,
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this phone number already exists.",
    });
  }

  const admin = await prisma.user.create({
    data: {
      firstName,
      lastName,
      username,
      email: email || null,
      phone,
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  return res.status(201).json({
    message: "Admin account created successfully.",
    credentials: {
      userId: admin.id,
      username: admin.username,
      password,
    },
  });
};
