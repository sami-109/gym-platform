import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import { getAdminGym } from "../utils/authorization.js";

export const getActivityLogs = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can view activity logs.",
    });
  }

  let where = {};

  if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym to view activity logs.",
      });
    }

    where = {
      gymId: adminGym.id,
    };
  }

  const activityLogs = await prisma.activityLog.findMany({
    where,
    include: {
      member: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      performedBy: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    activityLogs,
  });
};

export const editActivityLog = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can edit activity logs.",
    });
  }

  const logId = Number(req.params.id);

  if (Number.isNaN(logId)) {
    return res.status(400).json({
      message: "Invalid activity log ID.",
    });
  }

  const { details, createdAt } = req.body;

  const existingLog = await prisma.activityLog.findUnique({
    where: { id: logId },
  });

  if (!existingLog) {
    return res.status(404).json({
      message: "Activity log not found.",
    });
  }

  if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);

    if (!adminGym || existingLog.gymId !== adminGym.id) {
      return res.status(403).json({
        message: "You can only edit activity logs from your gym.",
      });
    }
  }

  const updatedLog = await prisma.activityLog.update({
    where: { id: logId },
    data: {
      ...(details !== undefined && { details }),
      ...(createdAt !== undefined && {
        createdAt: new Date(createdAt),
      }),
    },
  });

  return res.status(200).json({
    message: "Activity log updated successfully.",
    activityLog: updatedLog,
  });
};

export const deleteActivityLog = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can delete activity logs.",
    });
  }

  const logId = Number(req.params.id);

  if (Number.isNaN(logId)) {
    return res.status(400).json({
      message: "Invalid activity log ID.",
    });
  }

  const existingLog = await prisma.activityLog.findUnique({
    where: { id: logId },
  });

  if (!existingLog) {
    return res.status(404).json({
      message: "Activity log not found.",
    });
  }

  if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);

    if (!adminGym || existingLog.gymId !== adminGym.id) {
      return res.status(403).json({
        message: "You can only delete activity logs from your gym.",
      });
    }
  }

  await prisma.activityLog.delete({
    where: { id: logId },
  });

  return res.status(200).json({
    message: "Activity log deleted successfully.",
  });
};
