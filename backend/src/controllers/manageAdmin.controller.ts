import { type Request, type Response } from "express";
import { generatePassword } from "../utils/password.js";
import { generateUniqueUsername } from "../utils/username.js";

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

  // Generate an available username by adding a number if the base username exists.
  const username = await generateUniqueUsername(firstName, lastName);

  // Generate the user's password and its hash, only the hash is stored in the database.
  const { password, passwordHash } = await generatePassword();

  const admin = await prisma.user.create({
    data: {
      firstName,
      lastName,
      username,
      email: email || null,
      phone,
      passwordHash,
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

export const editAdmin = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can edit Admin accounts.",
    });
  }

  const adminId = Number(req.params.adminId);

  // Regular admins can only edit their own account, Super Admins can edit any admin.
  if (req.user.role === "ADMIN" && adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You can only edit your own Admin account.",
    });
  }

  const { firstName, lastName, phone, email } = req.body;

  const admin = await prisma.user.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    return res.status(404).json({
      message: "Admin account not found.",
    });
  }

  if (!firstName && !lastName && !phone && email === undefined) {
    return res.status(400).json({
      message: "At least one Admin field must be provided.",
    });
  }

  if (phone && phone !== admin.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (existingPhone) {
      return res.status(409).json({
        message: "An account with this phone number already exists.",
      });
    }
  }

  if (email && email !== admin.email) {
    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }
  }

  const updatedAdmin = await prisma.user.update({
    where: {
      id: adminId,
    },
    // Only update fields that were actually provided in the request
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
    },
  });

  return res.status(200).json({
    message: "Admin account updated successfully.",
    admin: {
      id: updatedAdmin.id,
      firstName: updatedAdmin.firstName,
      lastName: updatedAdmin.lastName,
      username: updatedAdmin.username,
      phone: updatedAdmin.phone,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      status: updatedAdmin.status,
    },
  });
};
