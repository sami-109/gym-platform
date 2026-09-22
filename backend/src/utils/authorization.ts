import prisma from "../lib/prisma.js";

export const getAdminGym = async (adminId: number) => {
  return prisma.gym.findUnique({
    where: {
      adminId,
    },
  });
};

export const isMemberInGym = async (memberId: number, gymId: number) => {
  const membership = await prisma.membership.findFirst({
    where: {
      userId: memberId,
      gymId,
    },
  });

  return Boolean(membership);
};

export const getManagedGym = async (
  gymId: number,
  userId: number,
  role: string,
) => {
  const gym = await prisma.gym.findUnique({
    where: {
      id: gymId,
    },
  });

  if (!gym) {
    return {
      gym: null,
      reason: "NOT_FOUND" as const,
    };
  }

  if (role === "ADMIN" && gym.adminId !== userId) {
    return {
      gym: null,
      reason: "NOT_MANAGED" as const,
    };
  }

  return {
    gym,
    reason: null,
  };
};
