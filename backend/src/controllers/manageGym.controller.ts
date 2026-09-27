import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";

export const createGym = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin can create gyms.",
    });
  }

  const { gymCode, address, description } = req.body;

  if (!gymCode || !address) {
    return res.status(400).json({
      message: "Gym code and address are required.",
    });
  }

  const gym = await prisma.gym.create({
    data: {
      gymCode,
      name: gymCode,
      address,
      ...(description && { description }),
    },
  });

  return res.status(201).json({
    message: "Gym created successfully.",
    gym: {
      id: gym.id,
      gymCode: gym.gymCode,
      name: gym.name,
      address: gym.address,
      description: gym.description,
    },
  });
};

export const getAllGyms = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin can view gyms.",
    });
  }

  const gyms = await prisma.gym.findMany({
    select: {
      id: true,
      name: true,
      gymCode: true,
      address: true,
      description: true,

      // Include the assigned Admin so the Super Admin can see each gym's current manager.
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  return res.status(200).json({ gyms });
};

export const editGym = async (req: Request, res: Response) => {
  const { gymId } = req.params;
  const { name, address, description } = req.body;

  const gymIdNumber = Number(gymId);

  if (Number.isNaN(gymIdNumber)) {
    return res.status(400).json({
      message: "Invalid gym ID.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      id: gymIdNumber,
    },
    include: {
      admin: true,
    },
  });

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (req.user?.role === "SUPER_ADMIN") {
    // Super Admins can edit any gym, Admins can only edit the gym they manage.
  } else if (req.user?.role === "ADMIN") {
    if (gym.adminId !== req.user.userId) {
      return res.status(403).json({
        message: "You can only edit the gym you manage.",
      });
    }
  } else {
    return res.status(403).json({
      message: "Only a Super Admin or Gym Admin can edit gyms.",
    });
  }

  if (!name && !address && !description) {
    return res.status(400).json({
      message: "At least one gym field must be provided.",
    });
  }

  const updatedGym = await prisma.gym.update({
    where: {
      id: gymIdNumber,
    },
    // Only update fields that were included in the request.
    data: {
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address }),
      ...(description !== undefined && { description }),
    },
  });

  return res.status(200).json({
    message: "Gym updated successfully.",
    gym: {
      id: updatedGym.id,
      name: updatedGym.name,
      gymCode: updatedGym.gymCode,
      address: updatedGym.address,
      description: updatedGym.description,
    },
  });
};
