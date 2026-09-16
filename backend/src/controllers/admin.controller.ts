import { type Request, type Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";

import prisma from "../lib/prisma.js";

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

export const getAllAdmins = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin can view Admin accounts.",
    });
  }

  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      username: true,
      email: true,
      managedGym: {
        select: {
          id: true,
          name: true,
          gymCode: true,
        },
      },
    },
  });

  return res.status(200).json({
    admins,
  });
};

export const disconnectAdminFromGym = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin can disconnect an Admin from a gym.",
    });
  }

  const { adminId } = req.params;

  const adminIdNumber = Number(adminId);

  const admin = await prisma.user.findUnique({
    where: {
      id: adminIdNumber,
    },
    include: {
      managedGym: true,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    return res.status(404).json({
      message: "Admin account not found.",
    });
  }

  if (!admin.managedGym) {
    return res.status(409).json({
      message: "This Admin is not managing a gym.",
    });
  }

  await prisma.gym.update({
    where: {
      id: admin.managedGym.id,
    },
    data: {
      adminId: null,
    },
  });

  return res.status(200).json({
    message: `${admin.firstName} ${admin.lastName} is no longer managing ${admin.managedGym.name}.`,
  });
};
