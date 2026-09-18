import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";

export const renewMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can renew memberships.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      id: gymId,
    },
  });

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (req.user.role === "ADMIN" && gym.adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Membership not found.",
    });
  }

  if (membership.status === "FROZEN") {
    return res.status(400).json({
      message:
        "Frozen memberships cannot be renewed. Resume the membership first.",
    });
  }

  const now = new Date();

  if (membership.expiryDate === null) {
    return res.status(500).json({
      message: "Membership has no expiry date and cannot be renewed.",
    });
  }

  let expiryDate = membership.expiryDate;

  let newStartDate: Date;
  let newExpiryDate: Date;

  if (expiryDate > now) {
    newStartDate = membership.startDate;
    newExpiryDate = new Date(expiryDate);

    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
  } else {
    newStartDate = now;
    newExpiryDate = new Date(now);

    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
  }

  const updatedMembership = await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      status: "ACTIVE",
      startDate: newStartDate,
      expiryDate: newExpiryDate,
    },
  });

  return res.status(200).json({
    message: "Membership renewed successfully.",
    membership: updatedMembership,
  });
};

export const freezeMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can freeze memberships.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      id: gymId,
    },
  });

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (req.user.role === "ADMIN" && gym.adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Membership not found.",
    });
  }

  if (membership.status !== "ACTIVE" || !membership.expiryDate) {
    return res.status(400).json({
      message: "Only active memberships can be frozen.",
    });
  }

  const now = new Date();

  if (membership.expiryDate <= now) {
    return res.status(400).json({
      message: "Expired memberships cannot be frozen.",
    });
  }

  const remainingSeconds = Math.floor(
    (membership.expiryDate.getTime() - now.getTime()) / 1000,
  );

  const frozenMembership = await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      status: "FROZEN",
      startDate: now,
      freezeStartDate: now,
      frozenRemainingSeconds: remainingSeconds,
      expiryDate: null,
    },
  });

  return res.status(200).json({
    message: "Membership frozen successfully.",
    membership: frozenMembership,
  });
};

export const resumeMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can resume memberships.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      id: gymId,
    },
  });

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (req.user.role === "ADMIN" && gym.adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Membership not found.",
    });
  }

  if (
    membership.status !== "FROZEN" ||
    membership.frozenRemainingSeconds === null
  ) {
    return res.status(400).json({
      message: "Only frozen memberships can be resumed.",
    });
  }

  const now = new Date();

  const newExpiryDate = new Date(
    now.getTime() + membership.frozenRemainingSeconds * 1000,
  );

  const resumedMembership = await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      status: "ACTIVE",
      startDate: now,
      expiryDate: newExpiryDate,
      freezeStartDate: null,
      frozenRemainingSeconds: null,
    },
  });

  return res.status(200).json({
    message: "Membership resumed successfully.",
    membership: resumedMembership,
  });
};

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
    // Super Admin can edit any gym.
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

export const adjustMembershipDates = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can adjust membership dates.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      id: gymId,
    },
  });

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (req.user.role === "ADMIN" && gym.adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Membership not found.",
    });
  }

  if (membership.status === "FROZEN") {
    return res.status(400).json({
      message:
        "Frozen memberships must be resumed before adjusting their dates.",
    });
  }

  const { startDate, expiryDate } = req.body;

  if (!startDate || !expiryDate) {
    return res.status(400).json({
      message: "Start date and expiry date are required.",
    });
  }

  const newStartDate = new Date(startDate);
  const newExpiryDate = new Date(expiryDate);

  if (
    Number.isNaN(newStartDate.getTime()) ||
    Number.isNaN(newExpiryDate.getTime())
  ) {
    return res.status(400).json({
      message: "Invalid start date or expiry date.",
    });
  }

  if (newExpiryDate < newStartDate) {
    return res.status(400).json({
      message: "Expiry date cannot be earlier than the start date.",
    });
  }

  const newStatus = newExpiryDate < new Date() ? "EXPIRED" : "ACTIVE";

  const updatedMembership = await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      startDate: newStartDate,
      expiryDate: newExpiryDate,
      status: newStatus,
    },
  });

  return res.status(200).json({
    message: "Membership dates adjusted successfully.",
    membership: updatedMembership,
  });
};

export const addDayPass = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can add a day pass.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      id: gymId,
    },
  });

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (req.user.role === "ADMIN" && gym.adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Membership not found.",
    });
  }

  if (membership.status === "FROZEN") {
    return res.status(400).json({
      message: "Frozen memberships must be resumed before adding a day pass.",
    });
  }

  if (!membership.expiryDate) {
    return res.status(400).json({
      message: "Membership does not have an expiry date.",
    });
  }

  const now = new Date();

  if (membership.expiryDate >= now) {
    return res.status(400).json({
      message: "Day passes can only be added to expired memberships.",
    });
  }

  const startDate = now;
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + 1);

  const updatedMembership = await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      status: "ACTIVE",
      startDate,
      expiryDate,
      freezeStartDate: null,
      frozenRemainingSeconds: null,
    },
  });

  return res.status(200).json({
    message: "Day pass added successfully.",
    membership: updatedMembership,
  });
};
