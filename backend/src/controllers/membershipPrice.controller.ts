import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getMembershipPrices = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only an Admin can view membership prices.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      adminId: req.user.userId,
    },
  });

  if (!gym) {
    return res.status(403).json({
      message: "You must be managing a gym.",
    });
  }

  const prices = await prisma.membershipPrice.findUnique({
    where: {
      gymId: gym.id,
    },
  });

  if (!prices) {
    return res.status(404).json({
      message: "Membership prices have not been set.",
    });
  }

  return res.status(200).json(prices);
};

export const updateMembershipPrices = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only an Admin can update membership prices.",
    });
  }

  const { dayPass, trial, oneMonth } = req.body;

  if (dayPass === undefined || trial === undefined || oneMonth === undefined) {
    return res.status(400).json({
      message: "All membership prices are required.",
    });
  }

  if (Number(dayPass) < 0 || Number(trial) < 0 || Number(oneMonth) < 0) {
    return res.status(400).json({
      message: "Membership prices cannot be negative.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      adminId: req.user.userId,
    },
  });

  if (!gym) {
    return res.status(403).json({
      message: "You must be managing a gym.",
    });
  }

  const prices = await prisma.membershipPrice.upsert({
    where: {
      gymId: gym.id,
    },
    update: {
      dayPass: Number(dayPass),
      trial: Number(trial),
      oneMonth: Number(oneMonth),
    },
    create: {
      gymId: gym.id,
      dayPass: Number(dayPass),
      trial: Number(trial),
      oneMonth: Number(oneMonth),
    },
  });

  return res.status(200).json(prices);
};
