import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getTransactions = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only an Admin can view transactions.",
    });
  }

  let transactions;

  if (req.user.role === "ADMIN") {
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

    transactions = await prisma.transaction.findMany({
      where: {
        gymId: gym.id,
      },
      include: {
        member: true,
      },
      orderBy: {
        transactionDate: "desc",
      },
    });
  } else {
    transactions = await prisma.transaction.findMany({
      include: {
        member: true,
      },
      orderBy: {
        transactionDate: "desc",
      },
    });
  }

  return res.status(200).json(transactions);
};
