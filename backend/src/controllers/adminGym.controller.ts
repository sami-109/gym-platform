import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";

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

export const connectAdminToGym = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin can connect an Admin to a gym.",
    });
  }
  const { gymId, adminId } = req.params;

  const gymIdNumber = Number(gymId);
  const adminIdNumber = Number(adminId);
  const admin = await prisma.user.findUnique({
    where: {
      id: adminIdNumber,
    },
  });
  if (!admin || admin.role !== "ADMIN") {
    return res.status(404).json({
      message: "Admin account not found.",
    });
  }
  const gym = await prisma.gym.findUnique({
    where: {
      id: gymIdNumber,
    },
  });
  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }
  // Prevent an Admin from managing more than one gym.
  const existingGym = await prisma.gym.findUnique({
    where: {
      adminId: adminIdNumber,
    },
  });
  if (existingGym) {
    return res.status(409).json({
      message: "This Admin is already managing a gym.",
    });
  }
  // Prevent a gym from being assigned to more than one Admin.
  if (gym.adminId !== null) {
    return res.status(409).json({
      message: "This gym already has an Admin.",
    });
  }
  const updatedGym = await prisma.gym.update({
    where: {
      id: gymIdNumber,
    },
    data: {
      adminId: adminIdNumber,
    },
  });
  return res.status(200).json({
    message: `${admin.firstName} ${admin.lastName} is now managing ${updatedGym.name}.`,
    gym: {
      id: updatedGym.id,
      gymCode: updatedGym.gymCode,
      name: updatedGym.name,
      adminId: updatedGym.adminId,
    },
  });
};
