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

  const newAmountPaid = Number(amountPaid);
  const newTransactionDate = new Date(transactionDate);

  const updatedTransaction = await prisma.transaction.update({
    where: {
      id: transactionId,
    },
    data: {
      action,
      amountPaid: newAmountPaid,
      profit: newAmountPaid,
      transactionDate: newTransactionDate,
    },
    include: {
      member: true,
    },
  });

  const changes: string[] = [];

  if (transaction.action !== action) {
    changes.push(`Action: ${transaction.action} → ${action}`);
  }

  if (Number(transaction.amountPaid) !== newAmountPaid) {
    changes.push(`Amount paid: ${transaction.amountPaid} → ${newAmountPaid}`);
  }

  if (transaction.transactionDate.getTime() !== newTransactionDate.getTime()) {
    changes.push(
      `Transaction date: ${transaction.transactionDate.toISOString()} → ${newTransactionDate.toISOString()}`,
    );
  }

  if (changes.length > 0) {
    await prisma.activityLog.create({
      data: {
        memberId: transaction.memberId,
        ...(transaction.memberFirstName !== null && {
          memberFirstName: transaction.memberFirstName,
        }),
        ...(transaction.memberLastName !== null && {
          memberLastName: transaction.memberLastName,
        }),
        gymId: transaction.gymId,
        performedByUserId: req.user.userId,
        action: "TRANSACTION_UPDATED",
        details: `Transaction #${transaction.id} updated. ${changes.join(", ")}`,
      },
    });
  }

  return res.status(200).json(updatedTransaction);
};
