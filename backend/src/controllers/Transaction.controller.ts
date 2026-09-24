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

export const deleteTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only an Admin can delete transactions.",
    });
  }

  const transactionId = Number(req.params.transactionId);

  if (!transactionId) {
    return res.status(400).json({
      message: "Invalid transaction ID.",
    });
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
  });

  if (!transaction) {
    return res.status(404).json({
      message: "Transaction not found.",
    });
  }

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

    if (transaction.gymId !== gym.id) {
      return res.status(403).json({
        message: "This transaction does not belong to your gym.",
      });
    }
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return res.status(200).json({
    message: "Transaction deleted successfully.",
  });
};

export const updateTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only an Admin can edit transactions.",
    });
  }

  const transactionId = Number(req.params.transactionId);

  if (!transactionId) {
    return res.status(400).json({
      message: "Invalid transaction ID.",
    });
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
  });

  if (!transaction) {
    return res.status(404).json({
      message: "Transaction not found.",
    });
  }

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

    if (transaction.gymId !== gym.id) {
      return res.status(403).json({
        message: "This transaction does not belong to your gym.",
      });
    }
  }

  const { action, amountPaid, transactionDate } = req.body;

  if (!action || amountPaid === undefined || !transactionDate) {
    return res.status(400).json({
      message: "Action, amount, and transaction date are required.",
    });
  }

  if (Number(amountPaid) < 0) {
    return res.status(400).json({
      message: "Amount cannot be negative.",
    });
  }

  const updatedTransaction = await prisma.transaction.update({
    where: {
      id: transactionId,
    },
    data: {
      action,
      amountPaid: Number(amountPaid),
      profit: Number(amountPaid),
      transactionDate: new Date(transactionDate),
    },
    include: {
      member: true,
    },
  });

  return res.status(200).json(updatedTransaction);
};
