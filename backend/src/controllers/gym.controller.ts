import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";

type CreateGymBody = {
  name: string;
  address: string;
  description?: string;
};

export const createGym = async (
  req: Request<{}, {}, CreateGymBody>,
  res: Response,
) => {
  const { name, address, description } = req.body;

  if (!name || !address) {
    return res.status(400).json({
      message: "Name and address are required.",
    });
  }

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only admins can create a gym.",
    });
  }

  const gym = await prisma.gym.create({
    data: {
      name,
      address,
      ...(description !== undefined && { description }),
      adminId: req.user.userId,
    },
  });

  return res.status(201).json({
    message: "Gym created successfully.",
    gym,
  });
};

export const getGyms = async (req: Request, res: Response) => {
  const gyms = await prisma.gym.findMany();

  return res.status(200).json({
    gyms,
  });
};

export const applyToGym = async (
  req: Request<{ gymId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);

  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
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

  const membership = await prisma.membership.create({
    data: {
      userId: req.user.userId,
      gymId: gym.id,
      status: "PENDING",
    },
  });

  return res.status(201).json({
    message: "Application submitted successfully.",
    membership,
  });
};

export const getPendingMemberships = async (
  req: Request<{ gymId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only admins can view pending applications.",
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

  if (gym.adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const memberships = await prisma.membership.findMany({
    where: {
      gymId,
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return res.status(200).json({
    memberships,
  });
};

export const approveMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only admins can approve memberships.",
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

  if (gym.adminId !== req.user.userId) {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
      status: "PENDING",
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Pending membership not found.",
    });
  }

  const startDate = new Date();
  const expiryDate = new Date(startDate);

  expiryDate.setDate(expiryDate.getDate() + 30);

  const updatedMembership = await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      status: "ACTIVE",
      startDate,
      expiryDate,
    },
  });

  return res.status(200).json({
    message: "Membership approved successfully.",
    membership: updatedMembership,
  });
};

export const renewMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only admins can renew memberships.",
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

  if (gym.adminId !== req.user.userId) {
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

  if (!membership.expiryDate) {
    return res.status(400).json({
      message: "Membership does not have an expiry date.",
    });
  }

  const now = new Date();

  let newExpiryDate: Date;
  let newStartDate = membership.startDate;

  if (membership.expiryDate > now) {
    // Membership is still active.
    // Extend the existing expiry by 30 days.
    newExpiryDate = new Date(membership.expiryDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
  } else {
    // Membership has expired.
    // Start a completely new 30-day period from now.
    newStartDate = now;
    newExpiryDate = new Date(now);
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
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

export const getMyMemberships = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: req.user.userId,
    },
    include: {
      gym: true,
    },
  });

  const membershipsWithDetails = [];

  for (const membership of memberships) {
    let status = membership.status;
    let totalSeconds = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (membership.expiryDate) {
      const now = new Date();

      if (membership.expiryDate <= now) {
        status = "EXPIRED";

        await prisma.membership.update({
          where: {
            id: membership.id,
          },
          data: {
            status: "EXPIRED",
          },
        });
      } else {
        totalSeconds = Math.floor(
          (membership.expiryDate.getTime() - now.getTime()) / 1000,
        );
        days = Math.floor(totalSeconds / 86400);
        hours = Math.floor((totalSeconds % 86400) / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
      }
    }

    membershipsWithDetails.push({
      ...membership,
      status,
      timeRemaining: {
        totalSeconds,
        days,
        hours,
        minutes,
        seconds,
      },
    });
  }

  return res.status(200).json({
    memberships: membershipsWithDetails,
  });
};

export const freezeMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only admins can freeze memberships.",
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

  if (gym.adminId !== req.user.userId) {
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

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only admins can resume memberships.",
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

  if (gym.adminId !== req.user.userId) {
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
