import { type Request, type Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { updateMembershipExpiration } from "../utils/membership.js";

export const createMember = async (req: Request, res: Response) => {
  const { firstName, lastName, phone, email, gymId } = req.body;
  if (!firstName || !lastName || !phone) {
    return res.status(400).json({
      message: "First name, last name, and phone are required.",
    });
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
    const adminGym = await prisma.gym.findUnique({
      where: {
        adminId: req.user.userId,
      },
    });

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

  const password = crypto.randomBytes(8).toString("hex");

  const hashedPassword = await bcrypt.hash(password, 10);

  const startDate = new Date();

  const expiryDate = new Date(startDate);
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  const result = await prisma.$transaction(async (tx) => {
    const member = await tx.user.create({
      data: {
        firstName,
        lastName,
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

    return { member, membership };
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
    const adminGym = await prisma.gym.findUnique({
      where: { adminId: req.user.userId },
    });
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
    const adminGym = await prisma.gym.findUnique({
      where: {
        adminId: req.user.userId,
      },
    });

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym to deactivate members.",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: memberId,
        gymId: adminGym.id,
      },
    });

    if (!membership) {
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

  const updatedMember = await prisma.user.update({
    where: {
      id: memberId,
    },
    data: {
      status: "DEACTIVATED",
    },
  });

  return res.status(200).json({
    message: "Member deactivated successfully.",
    member: {
      id: updatedMember.id,
      firstName: updatedMember.firstName,
      lastName: updatedMember.lastName,
      username: updatedMember.username,
      status: updatedMember.status,
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
    const adminGym = await prisma.gym.findUnique({
      where: {
        adminId: req.user.userId,
      },
    });

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym to activate members.",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: memberId,
        gymId: adminGym.id,
      },
    });

    if (!membership) {
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

  const updatedMember = await prisma.user.update({
    where: {
      id: memberId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  return res.status(200).json({
    message: "Member activated successfully.",
    member: {
      id: updatedMember.id,
      firstName: updatedMember.firstName,
      lastName: updatedMember.lastName,
      username: updatedMember.username,
      status: updatedMember.status,
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

  if (!firstName || !lastName || !phone) {
    return res.status(400).json({
      message: "First name, last name, and phone are required.",
    });
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
    const adminGym = await prisma.gym.findUnique({
      where: {
        adminId: req.user.userId,
      },
    });

    if (!adminGym) {
      return res.status(403).json({
        message: "You must be managing a gym to edit members.",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: memberId,
        gymId: adminGym.id,
      },
    });

    if (!membership) {
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

  const updatedMember = await prisma.user.update({
    where: {
      id: memberId,
    },
    data: {
      firstName,
      lastName,
      phone,
      email: email || null,
    },
  });

  return res.status(200).json({
    message: "Member updated successfully.",
    member: {
      id: updatedMember.id,
      firstName: updatedMember.firstName,
      lastName: updatedMember.lastName,
      username: updatedMember.username,
      phone: updatedMember.phone,
      email: updatedMember.email,
      status: updatedMember.status,
    },
  });
};
