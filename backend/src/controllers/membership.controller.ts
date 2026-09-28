import { getManagedGym } from "../utils/authorization.js";
import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import { updateMembershipExpiration } from "../utils/membership.js";
import { getAdminGym, isMemberInGym } from "../utils/authorization.js";
import { getNextTransactionNumber } from "../utils/transactionNumber.js";

export const getMyMembership = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "MEMBER") {
    return res.status(403).json({
      message: "Only members can view their own membership.",
    });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId: req.user.userId,
    },
    include: {
      gym: {
        select: {
          id: true,
          name: true,
          gymCode: true,
          address: true,
          description: true,
        },
      },
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Membership not found.",
    });
  }
  // Update the membership status if its expiry date has passed.
  const currentStatus = await updateMembershipExpiration(membership);

  return res.status(200).json({
    membership: {
      ...membership,
      status: currentStatus,
    },
  });
};

export const renewMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (Number.isNaN(gymId) || Number.isNaN(membershipId)) {
    return res.status(400).json({
      message: "Invalid gym or membership ID.",
    });
  }

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can renew memberships.",
    });
  }

  const managedGym = await getManagedGym(gymId, req.user.userId, req.user.role);

  if (managedGym.reason === "NOT_FOUND") {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (managedGym.reason === "NOT_MANAGED") {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
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

  // If the membership is still active, extend its existing expiry date.
  // Otherwise, start the renewed membership from now.

  if (expiryDate > now) {
    newStartDate = membership.startDate;
    newExpiryDate = new Date(expiryDate);

    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
  } else {
    newStartDate = now;
    newExpiryDate = new Date(now);

    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
  }

  const membershipPrice = await prisma.membershipPrice.findUnique({
    where: {
      gymId,
    },
  });

  if (!membershipPrice) {
    return res.status(400).json({
      message: "Membership prices have not been set for this gym.",
    });
  }

  // Update the membership and record the renewal in the transaction and activity log together.
  const result = await prisma.$transaction(async (tx) => {
    const updatedMembership = await tx.membership.update({
      where: {
        id: membershipId,
      },
      data: {
        status: "ACTIVE",
        startDate: newStartDate,
        expiryDate: newExpiryDate,
      },
    });

    const transactionNumber = await getNextTransactionNumber(tx);

    const transaction = await tx.transaction.create({
      data: {
        transactionNumber,
        memberId: membership.userId,
        memberFirstName: membership.user.firstName,
        memberLastName: membership.user.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "1-month",
        transactionDate: now,
        startDate: newStartDate,
        endDate: newExpiryDate,
        amountPaid: membershipPrice.oneMonth,
        profit: membershipPrice.oneMonth,
      },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        transactionId: transaction.id,
        memberId: membership.userId,
        memberFirstName: membership.user.firstName,
        memberLastName: membership.user.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "RENEWED",
        details: "Membership renewed.",
      },
    });

    return { updatedMembership, transaction, activityLog };
  });

  return res.status(200).json({
    message: "Membership renewed successfully.",
    membership: result.updatedMembership,
  });
};

export const freezeMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (Number.isNaN(gymId) || Number.isNaN(membershipId)) {
    return res.status(400).json({
      message: "Invalid gym or membership ID.",
    });
  }

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can freeze memberships.",
    });
  }

  const managedGym = await getManagedGym(gymId, req.user.userId, req.user.role);

  if (managedGym.reason === "NOT_FOUND") {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (managedGym.reason === "NOT_MANAGED") {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
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

  // Store the remaining membership time so it can be restored when the membership is resumed.
  const remainingSeconds = Math.floor(
    (membership.expiryDate.getTime() - now.getTime()) / 1000,
  );

  // Freeze the membership and record the action together.
  const result = await prisma.$transaction(async (tx) => {
    const frozenMembership = await tx.membership.update({
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

    const activityLog = await tx.activityLog.create({
      data: {
        memberId: membership.userId,
        memberFirstName: membership.user.firstName,
        memberLastName: membership.user.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "FROZEN",
        details: "Membership frozen.",
      },
    });

    return { frozenMembership, activityLog };
  });

  return res.status(200).json({
    message: "Membership frozen successfully.",
    membership: result.frozenMembership,
  });
};

export const resumeMembership = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (Number.isNaN(gymId) || Number.isNaN(membershipId)) {
    return res.status(400).json({
      message: "Invalid gym or membership ID.",
    });
  }

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can resume memberships.",
    });
  }

  const managedGym = await getManagedGym(gymId, req.user.userId, req.user.role);

  if (managedGym.reason === "NOT_FOUND") {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (managedGym.reason === "NOT_MANAGED") {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
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

  // Restore the membership using the amount of time saved when it was frozen.
  const newExpiryDate = new Date(
    now.getTime() + membership.frozenRemainingSeconds * 1000,
  );

  const result = await prisma.$transaction(async (tx) => {
    const resumedMembership = await tx.membership.update({
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

    const activityLog = await tx.activityLog.create({
      data: {
        memberId: membership.userId,
        memberFirstName: membership.user.firstName,
        memberLastName: membership.user.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "RESUMED",
        details: "Membership resumed.",
      },
    });

    return { resumedMembership, activityLog };
  });

  return res.status(200).json({
    message: "Membership resumed successfully.",
    membership: result.resumedMembership,
  });
};

export const adjustMembershipDates = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (Number.isNaN(gymId) || Number.isNaN(membershipId)) {
    return res.status(400).json({
      message: "Invalid gym or membership ID.",
    });
  }

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can adjust membership dates.",
    });
  }

  const managedGym = await getManagedGym(gymId, req.user.userId, req.user.role);

  if (managedGym.reason === "NOT_FOUND") {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (managedGym.reason === "NOT_MANAGED") {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
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

  // Automatically set the membership status based on the new expiry date.
  const newStatus = newExpiryDate < new Date() ? "EXPIRED" : "ACTIVE";

  // Update the membership dates and record the adjustment together.
  const result = await prisma.$transaction(async (tx) => {
    const updatedMembership = await tx.membership.update({
      where: {
        id: membershipId,
      },
      data: {
        startDate: newStartDate,
        expiryDate: newExpiryDate,
        status: newStatus,
      },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        memberId: membership.userId,
        memberFirstName: membership.user.firstName,
        memberLastName: membership.user.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "DATES_ADJUSTED",
        details: "Membership dates adjusted.",
      },
    });

    return { updatedMembership, activityLog };
  });

  return res.status(200).json({
    message: "Membership dates adjusted successfully.",
    membership: result.updatedMembership,
  });
};

export const addDayPass = async (
  req: Request<{ gymId: string; membershipId: string }>,
  res: Response,
) => {
  const gymId = Number(req.params.gymId);
  const membershipId = Number(req.params.membershipId);

  if (Number.isNaN(gymId) || Number.isNaN(membershipId)) {
    return res.status(400).json({
      message: "Invalid gym or membership ID.",
    });
  }

  if (
    !req.user ||
    (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")
  ) {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can add a day pass.",
    });
  }

  const managedGym = await getManagedGym(gymId, req.user.userId, req.user.role);

  if (managedGym.reason === "NOT_FOUND") {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  if (managedGym.reason === "NOT_MANAGED") {
    return res.status(403).json({
      message: "You do not manage this gym.",
    });
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
      gymId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
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

  // A day pass starts now and lasts for one day.
  const startDate = now;
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + 1);

  const membershipPrice = await prisma.membershipPrice.findUnique({
    where: {
      gymId,
    },
  });

  if (!membershipPrice) {
    return res.status(400).json({
      message: "Membership prices have not been set for this gym.",
    });
  }

  // Activate the membership for the day pass and record the payment and activity together.
  const result = await prisma.$transaction(async (tx) => {
    const updatedMembership = await tx.membership.update({
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

    const transactionNumber = await getNextTransactionNumber(tx);

    const transaction = await tx.transaction.create({
      data: {
        transactionNumber,
        memberId: membership.userId,
        memberFirstName: membership.user.firstName,
        memberLastName: membership.user.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "day-pass",
        transactionDate: now,
        startDate,
        endDate: expiryDate,
        amountPaid: membershipPrice.dayPass,
        profit: membershipPrice.dayPass,
      },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        transactionId: transaction.id,
        memberId: membership.userId,
        memberFirstName: membership.user.firstName,
        memberLastName: membership.user.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "DAY_PASS",
        details: "Day pass added.",
      },
    });

    return { updatedMembership, transaction, activityLog };
  });

  return res.status(200).json({
    message: "Day pass added successfully.",
    membership: result.updatedMembership,
  });
};

export const deactivateMember = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can deactivate members.",
    });
  }

  const memberId = Number(req.params.memberId);

  const member = await prisma.user.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!member || member.role !== "MEMBER") {
    return res.status(404).json({
      message: "Member not found.",
    });
  }

  if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym to deactivate members.",
      });
    }

    const isMember = await isMemberInGym(memberId, adminGym.id);

    if (!isMember) {
      return res.status(403).json({
        message: "You can only deactivate members of your gym.",
      });
    }
  }

  if (member.status === "DEACTIVATED") {
    return res.status(400).json({
      message: "Member is already deactivated.",
    });
  }

  // Deactivate the account and expire its membership together.
  const result = await prisma.$transaction(async (tx) => {
    const updatedMember = await tx.user.update({
      where: {
        id: memberId,
      },
      data: {
        status: "DEACTIVATED",
      },
    });

    const updatedMembership = await tx.membership.update({
      where: {
        userId: memberId,
      },
      data: {
        expiryDate: new Date(),
        status: "EXPIRED",
      },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        memberId: memberId,
        memberFirstName: member.firstName,
        memberLastName: member.lastName,
        gymId: updatedMembership.gymId,
        performedByUserId: req.user!.userId,
        action: "DEACTIVATED",
        details: "Member deactivated.",
      },
    });

    return { updatedMember, updatedMembership, activityLog };
  });

  return res.status(200).json({
    message: "Member deactivated successfully.",
    member: {
      id: result.updatedMember.id,
      firstName: result.updatedMember.firstName,
      lastName: result.updatedMember.lastName,
      username: result.updatedMember.username,
      status: result.updatedMember.status,
    },
    membership: {
      status: result.updatedMembership.status,
      startDate: result.updatedMembership.startDate,
      expiryDate: result.updatedMembership.expiryDate,
    },
  });
};

export const activateMember = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can activate members.",
    });
  }

  const memberId = Number(req.params.memberId);

  const member = await prisma.user.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!member || member.role !== "MEMBER") {
    return res.status(404).json({
      message: "Member not found.",
    });
  }

  if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym to activate members.",
      });
    }

    const isMember = await isMemberInGym(memberId, adminGym.id);

    if (!isMember) {
      return res.status(403).json({
        message: "You can only activate members of your gym.",
      });
    }
  }

  if (member.status === "ACTIVE") {
    return res.status(400).json({
      message: "Member is already active.",
    });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId: memberId,
    },
  });

  if (!membership) {
    return res.status(404).json({
      message: "Membership not found.",
    });
  }

  // Reactivate the member account and record the activation in the activity log together.
  const result = await prisma.$transaction(async (tx) => {
    const updatedMember = await tx.user.update({
      where: {
        id: memberId,
      },
      data: {
        status: "ACTIVE",
      },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        memberId: memberId,
        memberFirstName: updatedMember.firstName,
        memberLastName: updatedMember.lastName,
        gymId: membership.gymId,
        performedByUserId: req.user!.userId,
        action: "ACTIVATED",
        details: "Member activated.",
      },
    });

    return { updatedMember, activityLog };
  });

  return res.status(200).json({
    message: "Member activated successfully.",
    member: {
      id: result.updatedMember.id,
      firstName: result.updatedMember.firstName,
      lastName: result.updatedMember.lastName,
      username: result.updatedMember.username,
      status: result.updatedMember.status,
    },
  });
};
