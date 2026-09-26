import { type Request, type Response } from "express";
import { hashPassword } from "../utils/passwordHash.js";
import { generateMemberPassword } from "../utils/password.js";
import prisma from "../lib/prisma.js";
import { updateMembershipExpiration } from "../utils/membership.js";
import { getAdminGym, isMemberInGym } from "../utils/authorization.js";

const normalizeName = (name: string) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const createMember = async (req: Request, res: Response) => {
  const { firstName, lastName, phone, email, gymId, membershipType } = req.body;

  const nameRegex = /^[A-Za-zÀ-ÿ]+(?:[ '-][A-Za-zÀ-ÿ]+)*$/;

  if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
    return res.status(400).json({
      message: "First name and last name can only contain letters.",
    });
  }

  const normalizedFirstName = normalizeName(firstName);
  const normalizedLastName = normalizeName(lastName);

  if (!firstName || !lastName || !phone) {
    return res.status(400).json({
      message: "First name, last name, and phone are required.",
    });
  }

  if (!["1-month", "trial", "day-pass"].includes(membershipType)) {
    return res.status(400).json({
      message: "Invalid membership type.",
    });
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }
  }

  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  let targetGymId: number | undefined;

  if (req.user.role === "SUPER_ADMIN") {
    if (!gymId) {
      return res.status(400).json({
        message: "Gym ID is required for Super Admin member creation.",
      });
    }

    targetGymId = Number(gymId);
  } else if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym to create members.",
      });
    }

    targetGymId = adminGym.id;
  } else {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can create members.",
    });
  }

  if (targetGymId === undefined) {
    return res.status(400).json({
      message: "Invalid gym.",
    });
  }

  const gym = await prisma.gym.findUnique({
    where: {
      id: targetGymId,
    },
  });

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found.",
    });
  }

  let counter = 1;
  let username = `${gym.gymCode}${counter}`;

  while (await prisma.user.findUnique({ where: { username } })) {
    counter++;
    username = `${gym.gymCode}${counter}`;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, ...(email ? [{ email }] : [])],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this phone number or email already exists.",
    });
  }

  const password = generateMemberPassword();

  const hashedPassword = await hashPassword(password);

  const startDate = new Date();

  const expiryDate = new Date(startDate);

  const membershipPrices = await prisma.membershipPrice.findUnique({
    where: {
      gymId: gym.id,
    },
  });

  if (!membershipPrices) {
    return res.status(400).json({
      message: "Membership prices have not been set for this gym.",
    });
  }

  if (membershipType === "1-month") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else if (membershipType === "trial" || membershipType === "day-pass") {
    expiryDate.setDate(expiryDate.getDate() + 1);
  }

  let amountPaid = membershipPrices.oneMonth;

  if (membershipType === "trial") {
    amountPaid = membershipPrices.trial;
  } else if (membershipType === "day-pass") {
    amountPaid = membershipPrices.dayPass;
  }

  const result = await prisma.$transaction(async (tx) => {
    const member = await tx.user.create({
      data: {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        username,
        email: email || null,
        phone,
        passwordHash: hashedPassword,
        role: "MEMBER",
      },
    });

    const membership = await tx.membership.create({
      data: {
        userId: member.id,
        gymId: gym.id,
        status: "ACTIVE",
        startDate,
        expiryDate,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        memberId: member.id,
        memberFirstName: member.firstName,
        memberLastName: member.lastName,
        gymId: gym.id,
        performedByUserId: req.user!.userId,
        action: membershipType,
        transactionDate: new Date(),
        startDate,
        endDate: expiryDate,
        amountPaid,
        profit: amountPaid,
      },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        memberId: member.id,
        memberFirstName: member.firstName,
        memberLastName: member.lastName,
        gymId: gym.id,
        performedByUserId: req.user!.userId,
        action: membershipType,
        details: `Created member ${member.firstName} ${member.lastName}.`,
      },
    });

    return { member, membership, transaction, activityLog };
  });

  return res.status(201).json({
    message: "Member created successfully.",
    credentials: {
      userId: result.member.id,
      username: result.member.username,
      password,
    },
    membership: {
      gymId: result.membership.gymId,
      status: result.membership.status,
      startDate: result.membership.startDate,
      expiryDate: result.membership.expiryDate,
    },
  });
};

export const getMembers = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }
  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Only the Super Admin or Gym Admin can view members." });
  }
  let gymId: number | undefined;
  if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);
    if (!adminGym) {
      return res
        .status(403)
        .json({ message: "You must be managing a gym to view members." });
    }
    gymId = adminGym.id;
  }
  const memberships = await prisma.membership.findMany({
    ...(gymId !== undefined && { where: { gymId } }),
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          username: true,
          status: true,
        },
      },
      gym: {
        select: {
          id: true,
          name: true,
          gymCode: true,
        },
      },
    },
  });

  for (const membership of memberships) {
    const currentStatus = await updateMembershipExpiration(membership);

    membership.status = currentStatus ?? membership.status;
  }

  return res.status(200).json({
    members: memberships,
  });
};

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
  const currentStatus = await updateMembershipExpiration(membership);

  return res.status(200).json({
    membership: {
      ...membership,
      status: currentStatus,
    },
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

export const editMember = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can edit members.",
    });
  }

  const memberId = Number(req.params.memberId);

  const { firstName, lastName, phone, email } = req.body;

  const nameRegex = /^[A-Za-zÀ-ÿ]+(?:[ '-][A-Za-zÀ-ÿ]+)*$/;

  if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
    return res.status(400).json({
      message: "First name and last name can only contain letters.",
    });
  }

  const normalizedFirstName = normalizeName(firstName);
  const normalizedLastName = normalizeName(lastName);

  if (!firstName || !lastName || !phone) {
    return res.status(400).json({
      message: "First name, last name, and phone are required.",
    });
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }
  }

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
        message: "You must be managing a gym to edit members.",
      });
    }

    const isMember = await isMemberInGym(memberId, adminGym.id);

    if (!isMember) {
      return res.status(403).json({
        message: "You can only edit members of your gym.",
      });
    }
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          phone,
          NOT: {
            id: memberId,
          },
        },
        ...(email
          ? [
              {
                email,
                NOT: {
                  id: memberId,
                },
              },
            ]
          : []),
      ],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this phone number or email already exists.",
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

  const result = await prisma.$transaction(async (tx) => {
    const nameChanged =
      member.firstName !== normalizedFirstName ||
      member.lastName !== normalizedLastName;

    const phoneChanged = member.phone !== phone;
    const emailChanged = member.email !== (email || null);

    const memberChanged = nameChanged || phoneChanged || emailChanged;

    const updatedMember = await tx.user.update({
      where: {
        id: memberId,
      },
      data: {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        phone,
        email: email || null,
      },
    });

    if (nameChanged) {
      await tx.activityLog.updateMany({
        where: {
          memberId,
        },
        data: {
          memberFirstName: updatedMember.firstName,
          memberLastName: updatedMember.lastName,
        },
      });

      await tx.transaction.updateMany({
        where: {
          memberId,
        },
        data: {
          memberFirstName: updatedMember.firstName,
          memberLastName: updatedMember.lastName,
        },
      });
    }

    if (memberChanged) {
      await tx.activityLog.create({
        data: {
          memberId: memberId,
          memberFirstName: updatedMember.firstName,
          memberLastName: updatedMember.lastName,
          gymId: membership.gymId,
          performedByUserId: req.user!.userId,
          action: "MEMBER_UPDATED",
          details: "Member information updated.",
        },
      });
    }

    return { updatedMember };
  });

  return res.status(200).json({
    message: "Member updated successfully.",
    member: {
      id: result.updatedMember.id,
      firstName: result.updatedMember.firstName,
      lastName: result.updatedMember.lastName,
      username: result.updatedMember.username,
      phone: result.updatedMember.phone,
      email: result.updatedMember.email,
      status: result.updatedMember.status,
    },
  });
};

export const retrieveCredentials = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only the Super Admin or Gym Admin can retrieve credentials.",
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
        message: "You must be managing a gym to retrieve credentials.",
      });
    }

    const isMember = await isMemberInGym(memberId, adminGym.id);

    if (!isMember) {
      return res.status(403).json({
        message: "You can only retrieve credentials for members of your gym.",
      });
    }
  }

  const newPassword = generateMemberPassword();
  const hashedPassword = await hashPassword(newPassword);

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

  const result = await prisma.$transaction(async (tx) => {
    const updatedMember = await tx.user.update({
      where: {
        id: memberId,
      },
      data: {
        passwordHash: hashedPassword,
      },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        memberId: memberId,
        memberFirstName: updatedMember.firstName,
        memberLastName: updatedMember.lastName,
        gymId: membership.gymId,
        performedByUserId: req.user!.userId,
        action: "CREDENTIALS_RETRIEVED",
        details: "Member credentials retrieved.",
      },
    });

    return { updatedMember, activityLog };
  });

  return res.status(200).json({
    message: "Credentials reset successfully.",
    credentials: {
      userId: result.updatedMember.id,
      username: result.updatedMember.username,
      password: newPassword,
    },
  });
};

export const deleteMember = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only an Admin can delete members.",
    });
  }

  const memberId = Number(req.params.memberId);

  if (!memberId) {
    return res.status(400).json({
      message: "Invalid member ID.",
    });
  }

  const member = await prisma.user.findUnique({
    where: { id: memberId },
    include: {
      memberships: true,
    },
  });

  if (!member || member.role !== "MEMBER") {
    return res.status(404).json({
      message: "Member not found.",
    });
  }

  let gymId: number | null = null;

  if (req.user.role === "ADMIN") {
    const adminGym = await getAdminGym(req.user.userId);

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym.",
      });
    }

    const memberInGym = await isMemberInGym(memberId, adminGym.id);

    if (!memberInGym) {
      return res.status(403).json({
        message: "This member does not belong to your gym.",
      });
    }

    gymId = adminGym.id;
  } else if (member.memberships.length > 0) {
    gymId = member.memberships[0]?.gymId ?? null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        memberId: member.id,
        memberFirstName: member.firstName,
        memberLastName: member.lastName,
        gymId,
        performedByUserId: req.user!.userId,
        action: "MEMBER_DELETED",
        details: `Deleted member ${member.firstName} ${member.lastName}.`,
      },
    });

    await tx.user.delete({
      where: { id: memberId },
    });
  });

  return res.status(200).json({
    message: "Member deleted successfully.",
  });
};
